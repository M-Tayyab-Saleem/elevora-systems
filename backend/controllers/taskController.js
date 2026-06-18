const Task = require("../models/taskSchema");
const Project = require("../models/projectSchema");
const catchAsync = require("../utils/catchAsync");
const { NotFoundError, BadRequestError } = require("../utils/ExpressError");
const { createNotification } = require('../utils/notificationService');

// Create Task
exports.createTask = catchAsync(async (req, res) => {
  const { title, description, project, team, priority, dueDate, duration } = req.body;

  const projectExists = await Project.findOne({ _id: project, company: req.companyId });
  if (!projectExists) throw new NotFoundError("Project");

  const task = new Task({
    title,
    description,
    project,
    team,
    priority,
    dueDate,
    duration,
    company: req.companyId,
  });

  const savedTask = await task.save();

  if (savedTask.team && savedTask.team.length > 0) {
    try {
      const notifPromises = savedTask.team.map(memberId =>
        createNotification({
          recipient: memberId,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned the task "${savedTask.title}" in project "${projectExists.title}".`,
          relatedEntity: { entityType: 'task', entityId: savedTask._id },
        })
      );
      await Promise.all(notifPromises);
    } catch (notifErr) {
      console.error('[Notification] Task created:', notifErr.message);
    }
  }

  res.status(201).json({ status: 'success', data: savedTask, message: 'Created successfully' });
});

// Get All Tasks
exports.getAllTasks = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search = '', project, status, priority, assignee } = req.query;
  const skip = (page - 1) * limit;

  const filter = {
    company: req.companyId,
    ...(project && { project }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignee && { team: assignee }),
    ...(search && {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    })
  };

  const [data, total] = await Promise.all([
    Task.find(filter)
      .populate("team", "name email avatar")
      .populate("project", "title")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Task.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get Task by ID
exports.getTaskById = catchAsync(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, company: req.companyId })
    .populate("team", "name email avatar")
    .populate("project", "title")
    .populate("comments.user", "name email avatar");

  if (!task) throw new NotFoundError("Task");

  res.status(200).json({ status: 'success', data: task });
});

// Update Task
exports.updateTask = catchAsync(async (req, res) => {
  const {
    title, description, team, priority, dueDate, duration,
    completionPercent, workedHours, status
  } = req.body;

  const task = await Task.findOne({ _id: req.params.id, company: req.companyId });
  if (!task) throw new NotFoundError("Task");

  const previousTeam = task.team.map(id => id.toString());
  const previousStatus = task.status;

  task.title = title || task.title;
  task.description = description || task.description;
  task.team = team || task.team;
  task.priority = priority || task.priority;
  task.dueDate = dueDate || task.dueDate;
  task.duration = duration || task.duration;
  task.completionPercent = completionPercent !== undefined ? completionPercent : task.completionPercent;
  task.workedHours = workedHours !== undefined ? workedHours : task.workedHours;
  task.status = status || task.status;

  const updatedTask = await task.save();

  if (team && team.length > 0) {
    const newMembers = team.filter(id => !previousTeam.includes(id.toString()));
    if (newMembers.length > 0) {
      const projectDoc = await Project.findOne({ _id: updatedTask.project, company: req.companyId }).select('title').lean();
      try {
        const notifPromises = newMembers.map(memberId =>
          createNotification({
            recipient: memberId,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: `You have been assigned the task "${updatedTask.title}" in project "${projectDoc?.title}".`,
            relatedEntity: { entityType: 'task', entityId: updatedTask._id },
          })
        );
        await Promise.all(notifPromises);
      } catch (notifErr) {
        console.error('[Notification] Task team update:', notifErr.message);
      }
    }
  }

  res.status(200).json({ status: 'success', data: updatedTask, message: 'Updated successfully' });
});

// Update Task Status
exports.updateTaskStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, company: req.companyId },
    { status },
    { new: true, runValidators: true }
  );

  if (!task) throw new NotFoundError("Task");
  res.status(200).json({ status: 'success', data: task, message: 'Status updated' });
});

// Delete Task
exports.deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, company: req.companyId });
  if (!task) throw new NotFoundError("Task");

  if (task.team && task.team.length > 0) {
    task.team.forEach(memberId => {
      createNotification({
        recipient: memberId,
        type: 'TASK_DELETED',
        title: 'Task Removed',
        message: `Task "${task.title}" has been removed from the project.`,
        relatedEntity: { entityType: 'task', entityId: task._id },
      }).catch(console.error);
    });
  }

  await task.deleteOne();
  res.status(200).json({ status: 'success', message: "Task deleted successfully", data: null });
});

// Add Comment to Task
exports.addComment = catchAsync(async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id || req.user._id;

  const task = await Task.findOne({ _id: req.params.id, company: req.companyId });
  if (!task) throw new NotFoundError("Task");

  task.comments.push({
    user: userId,
    text,
  });

  const updatedTask = await task.save();
  res.status(200).json({ status: 'success', data: updatedTask });
});

// Get Tasks for Project
exports.getProjectTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId, company: req.companyId })
    .populate("team", "name email avatar")
    .populate("project", "title");

  res.status(200).json({ status: 'success', data: tasks });
});

// Get Tasks for User
exports.getUserTasks = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const tasks = await Task.find({ team: userId, company: req.companyId })
    .populate("team", "name email avatar")
    .populate("project", "title");

  res.status(200).json({ status: 'success', data: tasks });
});