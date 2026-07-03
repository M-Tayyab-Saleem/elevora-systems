const TimeLog = require("../models/timeLogsSchema");
const { BadRequestError, NotFoundError } = require("../utils/ExpressError");
const { moment, TIMEZONE } = require("../utils/dateUtils");
const { normalizeRole } = require("../utils/rbacUtils");
const { cloudinary } = require("../config/cloudinaryConfig");

class TimeLogService {
  async createTimeLog(user, companyId, data, files) {
    const { job, date, description, hours, employeeId } = data;
    const role = normalizeRole(user.role);
    const employee = (employeeId && ['super admin', 'admin'].includes(role)) ? employeeId : user.id || user._id;

    const estDate = moment.tz(date, TIMEZONE).startOf('day').toDate();

    const attachments = files?.map(file => ({
      blobName: file.blobName,
      url: file.url || file.path,
      originalname: file.originalname,
      format: file.mimetype,
      size: file.size
    })) || [];

    const timeLog = new TimeLog({
      employee,
      company: companyId,
      job,
      date: estDate, 
      description,
      hours,
      attachments
    });

    return timeLog.save();
  }

  async getEmployeeTimeLogs(user, companyId, query) {
    const { date, userId } = query; 
    const roleKey = normalizeRole(user.role);
    const employee = (userId && ['super admin', 'admin', 'manager'].includes(roleKey)) ? userId : user.id || user._id;

    const dbQuery = { employee, company: companyId };
    if (date) {
      const startDate = moment.tz(date, TIMEZONE).startOf('day').toDate();
      const endDate = moment.tz(date, TIMEZONE).endOf('day').toDate();

      dbQuery.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    return TimeLog.find(dbQuery).sort({ date: 1 });
  }

  async updateTimeLog(timeLogId, data, files) {
    const { job, date, description, hours } = data;

    const timeLog = await TimeLog.findById(timeLogId);
    if (!timeLog) throw new NotFoundError("TimeLog");

    if (timeLog.isAddedToTimesheet) {
      throw new BadRequestError("Cannot update time log already added to a timesheet");
    }

    if (files && files.length > 0) {
      for (const att of timeLog.attachments) {
        if (att.blobName) {
          try {
            await cloudinary.uploader.destroy(att.blobName);
          } catch (err) {
            console.error(`Failed to delete old attachment from Cloudinary: ${att.blobName}`, err);
          }
        }
      }
      
      timeLog.attachments = files.map(file => ({
        blobName: file.blobName,
        url: file.url || file.path,
        originalname: file.originalname,
        format: file.mimetype,
        size: file.size
      }));
    }

    timeLog.job = job;
    timeLog.date = moment.tz(date, TIMEZONE).startOf('day').toDate();
    timeLog.description = description;
    timeLog.hours = hours;

    return timeLog.save();
  }

  async deleteTimeLog(timeLogId) {
    const timeLog = await TimeLog.findById(timeLogId);
    if (!timeLog) throw new NotFoundError("TimeLog");
    if (timeLog.isAddedToTimesheet) throw new BadRequestError("Cannot delete log already in timesheet");
    
    for (const att of timeLog.attachments) {
      if (att.blobName) {
        try {
          await cloudinary.uploader.destroy(att.blobName);
        } catch (err) {
          console.error(`Failed to delete attachment from Cloudinary: ${att.blobName}`, err);
        }
      }
    }
    
    await timeLog.deleteOne();
  }

  async downloadTimeLogAttachment(timeLogId, attachmentId) {
    const timeLog = await TimeLog.findById(timeLogId);
    if (!timeLog) throw new NotFoundError("TimeLog");
    const attachment = timeLog.attachments.id(attachmentId);
    if (!attachment) throw new NotFoundError("Attachment");

    try {
      if (attachment.url) {
        return attachment.url;
      } else {
        throw new BadRequestError("No valid attachment URL found");
      }
    } catch (error) {
      console.error("Download error:", error);
      throw new BadRequestError("Failed to generate download link");
    }
  }
}

module.exports = new TimeLogService();
