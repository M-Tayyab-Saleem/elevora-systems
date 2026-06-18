const Timesheet = require("../models/timesheetSchema");
const TimeLog = require("../models/timeLogsSchema");
const User = require("../models/userSchema"); 
const catchAsync = require("../utils/catchAsync");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/ExpressError");
const { getStartOfESTDay, getEndOfESTDay, moment, TIMEZONE } = require("../utils/dateUtils");
const { createNotification } = require('../utils/notificationService');

// --- 1. CREATE TIMESHEET ---
exports.createTimesheet = catchAsync(async (req, res) => {
  let { name, description, timeLogs, date, employeeId } = req.body;
  const role = req.user.role ? req.user.role.toLowerCase() : "";
  
  let employee = req.user.id || req.user._id;
  let employeeName = req.user.name;

  if (employeeId && ['super admin', 'admin'].includes(role)) {
      const targetUser = await User.findOne({ _id: employeeId, company: req.companyId });
      if (!targetUser) throw new BadRequestError("Target employee not found");
      employee = targetUser._id;
      employeeName = targetUser.name;
  }

  let logIds = Array.isArray(timeLogs) ? timeLogs : (timeLogs ? [timeLogs] : []);
  if (logIds.length === 0) throw new BadRequestError("No time logs provided");

  let timesheetDate = date ? moment.tz(date, TIMEZONE).startOf('day').toDate() : getStartOfESTDay();

  const existingTimesheet = await Timesheet.findOne({
    company: req.companyId,
    employee,
    date: { $gte: getStartOfESTDay(timesheetDate), $lte: getEndOfESTDay(timesheetDate) }
  });

  if (existingTimesheet) {
    throw new BadRequestError(`You have already submitted a timesheet for ${moment(timesheetDate).tz(TIMEZONE).format('MM-DD-YYYY')}.`);
  }

  const logs = await TimeLog.find({ _id: { $in: logIds }, employee, isAddedToTimesheet: false, company: req.companyId });
  if (logs.length !== logIds.length) {
    throw new BadRequestError("Invalid logs or logs already added to another timesheet");
  }

  const submittedHours = logs.reduce((total, log) => total + log.hours, 0);

  const startOfWeek = moment(timesheetDate).tz(TIMEZONE).startOf('isoWeek').toDate();
  const endOfWeek = moment(timesheetDate).tz(TIMEZONE).endOf('isoWeek').toDate();

  const weeklyTimesheets = await Timesheet.find({
    company: req.companyId,
    employee,
    date: { $gte: startOfWeek, $lte: endOfWeek },
    status: { $in: ["Pending", "Approved"] }
  });

  const weeklyTotalHours = weeklyTimesheets.reduce((total, sheet) => total + sheet.submittedHours, 0);
  if (weeklyTotalHours + submittedHours > 40) throw new BadRequestError(`Weekly limit (40h) exceeded.`);

  const timesheet = new Timesheet({
    name, description, employee, employeeName,
    date: timesheetDate,
    submittedHours,
    timeLogs: logIds,
    company: req.companyId
  });

  const savedTimesheet = await timesheet.save();
  await TimeLog.updateMany({ _id: { $in: logIds }, company: req.companyId }, { isAddedToTimesheet: true, timesheet: savedTimesheet._id });

  res.status(201).json({ status: 'success', data: savedTimesheet, message: 'Timesheet submitted successfully' });
});

// --- 2. GET WEEKLY TIMESHEETS ---
exports.getWeeklyTimesheets = catchAsync(async (req, res) => {
  const { weekStart, userId } = req.query; 
  if (!weekStart) throw new BadRequestError("Week start date is required");

  const startDate = moment.tz(weekStart, TIMEZONE).startOf('day').toDate();
  const endDate = moment(startDate).add(6, 'days').endOf('day').toDate();

  let query = { date: { $gte: startDate, $lte: endDate }, company: req.companyId };
  const roleKey = req.user.role ? req.user.role.toLowerCase() : "";

  if (userId && ['super admin', 'admin', 'manager'].includes(roleKey)) {
      query.employee = userId;
  } else {
      query.employee = req.user.id || req.user._id;
  }

  const timesheets = await Timesheet.find(query)
    .populate("timeLogs")
    .populate("employee", "name email role") 
    .sort({ date: 1 });

  const weeklyTotal = timesheets.reduce((total, sheet) => total + sheet.submittedHours, 0);

  res.status(200).json({
    status: 'success',
    weekStart: startDate.toISOString(),
    weekEnd: endDate.toISOString(),
    timesheets,
    weeklyTotal,
    remainingHours: Math.max(0, 40 - weeklyTotal) 
  });
});

// --- 3. GET ALL TIMESHEETS ---
exports.getAllTimesheets = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, employeeId, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  let query = { company: req.companyId };

  if (status && status !== 'All') query.status = status;
  if (employeeId && employeeId !== 'All') query.employee = employeeId;
  
  if (startDate && endDate) {
    query.date = { 
      $gte: moment.tz(startDate, TIMEZONE).startOf('day').toDate(), 
      $lte: moment.tz(endDate, TIMEZONE).endOf('day').toDate() 
    };
  }

  const role = req.user.role ? req.user.role.toLowerCase() : "";
  if (role === 'manager' || role === 'admin') {
     const subordinates = await User.find({ reportsTo: req.user.id || req.user._id }).select('_id');
     const validIds = subordinates.map(u => u._id);
     validIds.push(req.user.id || req.user._id);
     
     if (query.employee) {
       if (!validIds.map(id => id.toString()).includes(query.employee.toString())) {
         query.employee = { $in: [] }; 
       }
     } else {
       query.employee = { $in: validIds };
     }
  } else if (role !== 'super admin' && role !== 'hr') {
     query.employee = req.user.id || req.user._id;
  }

  const [data, total] = await Promise.all([
    Timesheet.find(query)
      .populate("timeLogs")
      .populate("employee", "name email role avatar")
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1 }),
    Timesheet.countDocuments(query)
  ]);

  res.status(200).json({
    status: 'success',
    data,
    timesheets: data, // For backward compatibility with some frontend parts
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// --- 4. GET BY ID ---
exports.getTimesheetById = catchAsync(async (req, res) => {
  const timesheet = await Timesheet.findOne({ _id: req.params.id, company: req.companyId }).populate("timeLogs");
  if (!timesheet) throw new NotFoundError("Timesheet");
  res.status(200).json({ status: 'success', data: timesheet });
});

// --- 5. UPDATE STATUS ---
exports.updateTimesheetStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, approvedHours, comment } = req.body;
  const timesheet = await Timesheet.findOne({ _id: id, company: req.companyId }).populate('employee', 'name email');
  if (!timesheet) throw new NotFoundError("Timesheet");

  const currentUserId = (req.user.id || req.user._id).toString();
  if (timesheet.employee._id.toString() === currentUserId) {
    throw new ForbiddenError("You cannot approve your own timesheet.");
  }

  timesheet.status = status;
  if (approvedHours !== undefined) timesheet.approvedHours = approvedHours;
  
  if (comment && comment.trim()) {
    timesheet.comments.push({
      author: req.user?.name || "Unknown",
      authorId: req.user?.id || req.user?._id,
      content: comment.trim(),
      time: new Date(),
      avatar: req.user?.avatar || ""
    });
  }
  
  const updatedTimesheet = await timesheet.save();

  try {
    await createNotification({
      recipient: timesheet.employee._id,
      type: status === 'Approved' ? 'TIMESHEET_APPROVED' : 'TIMESHEET_REJECTED',
      title: `Timesheet ${status}`,
      message: `Your timesheet for ${new Date(timesheet.date).toDateString()} has been ${status.toLowerCase()}.`,
      relatedEntity: { entityType: 'timesheet', entityId: updatedTimesheet._id },
    });
  } catch (err) {}

  res.status(200).json({ status: 'success', data: updatedTimesheet, message: `Timesheet ${status.toLowerCase()}` });
});

// --- 6. DELETE TIMESHEET ---
exports.deleteTimesheet = catchAsync(async (req, res) => {
  const timesheet = await Timesheet.findOne({ _id: req.params.id, company: req.companyId });
  if (!timesheet) throw new NotFoundError("Timesheet");

  if (timesheet.status !== 'Pending') {
    throw new ForbiddenError("You can only delete timesheets that are in Pending status");
  }

  if (timesheet.employee.toString() !== (req.user.id || req.user._id).toString()) {
    throw new ForbiddenError("You can only delete your own timesheets");
  }

  if (timesheet.timeLogs && timesheet.timeLogs.length > 0) {
    await TimeLog.updateMany(
      { _id: { $in: timesheet.timeLogs }, company: req.companyId },
      { $set: { isAddedToTimesheet: false, timesheet: null } }
    );
  }

  await timesheet.deleteOne();
  res.status(200).json({ status: 'success', message: "Timesheet deleted successfully" });
});
