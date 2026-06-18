const Project = require("../models/projectSchema");
const Task = require("../models/taskSchema");
const catchAsync = require("../utils/catchAsync");
const { NotFoundError, BadRequestError } = require("../utils/ExpressError");
const { createNotification } = require('../utils/notificationService');

// Create Project
exports.createProject = catchAsync(async (req, res) => {
  const { title, description, team, strict, isPublic, startDate, dueDate } = req.body;
  const owner = req.user.id || req.user._id;

  const project = new Project({
    title,
    description,
    team,
    owner,
    strict,
    isPublic,
    startDate,
    dueDate,
    company: req.companyId,
  });

  const savedProject = await project.save();

  if (savedProject.team && savedProject.team.length > 0) {
    savedProject.team.forEach(memberId => {
      createNotification({
        recipient: memberId,
        type: 'PROJECT_CREATED',
        title: 'New Project Assignment',
        message: `A new project "${savedProject.title}" has been created and you are assigned to it.`,
        relatedEntity: { entityType: 'project', entityId: savedProject._id },
      }).catch(err => console.error('Notification failed:', err));
    });
  }

  res.status(201).json({ status: 'success', data: savedProject, message: 'Created successfully' });
});

// Get All Projects
exports.getAllProjects = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search = '', status, myProjects } = req.query;
  const skip = (page - 1) * limit;

  const userId = req.user.id || req.user._id;

  const filter = {
    company: req.companyId,
    ...(status && { status }),
    ...(search && {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }),
    ...(myProjects === 'true' && {
      $or: [{ owner: userId }, { team: userId }],
    })
  };

  const [data, total] = await Promise.all([
    Project.find(filter)
      .populate("team", "name email avatar")
      .populate("owner", "name email avatar")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Project.countDocuments(filter)
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

// Get Project by ID
exports.getProjectById = catchAsync(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, company: req.companyId })
    .populate("team", "name email avatar")
    .populate("owner", "name email avatar");

  if (!project) throw new NotFoundError("Project");

  res.status(200).json({ status: 'success', data: project });
});

// Update Project
exports.updateProject = catchAsync(async (req, res) => {
  const { title, description, team, status, strict, isPublic, startDate, dueDate } = req.body;

  const project = await Project.findOne({ _id: req.params.id, company: req.companyId });
  if (!project) throw new NotFoundError("Project");

  const previousTeam = project.team.map(id => id.toString());

  project.title = title || project.title;
  project.description = description || project.description;
  project.team = team || project.team;
  project.status = status || project.status;
  project.strict = strict !== undefined ? strict : project.strict;
  project.isPublic = isPublic !== undefined ? isPublic : project.isPublic;
  project.startDate = startDate || project.startDate;
  project.dueDate = dueDate || project.dueDate;

  const updatedProject = await project.save();

  if (team && team.length > 0) {
    const newMembers = team.filter(id => !previousTeam.includes(id.toString()));
    newMembers.forEach(memberId => {
      createNotification({
        recipient: memberId,
        type: 'PROJECT_MEMBER_ADDED',
        title: 'Added to Project',
        message: `You have been added to the project "${updatedProject.title}".`,
        relatedEntity: { entityType: 'project', entityId: updatedProject._id },
      }).catch(err => console.error('Notification failed:', err));
    });
  }

  if (status && status !== project.status) {
    const recipients = [...new Set([...updatedProject.team.map(id => id.toString()), updatedProject.owner.toString()])];
    recipients.forEach(memberId => {
      createNotification({
        recipient: memberId,
        type: 'PROJECT_STATUS_UPDATED',
        title: 'Project Status Updated',
        message: `Project "${updatedProject.title}" is now marked as ${status}.`,
        relatedEntity: { entityType: 'project', entityId: updatedProject._id },
      }).catch(err => console.error('Notification failed:', err));
    });
  }

  res.status(200).json({ status: 'success', data: updatedProject, message: 'Updated successfully' });
});

// Delete Project
exports.deleteProject = catchAsync(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, company: req.companyId });
  if (!project) throw new NotFoundError("Project");

  const tasksCount = await Task.countDocuments({ project: project._id, company: req.companyId });
  if (tasksCount > 0) {
    throw new BadRequestError("Cannot delete project with associated tasks");
  }

  const recipients = [...new Set([...project.team.map(id => id.toString()), project.owner.toString()])];
  recipients.forEach(memberId => {
    createNotification({
      recipient: memberId,
      type: 'PROJECT_DELETED',
      title: 'Project Deleted',
      message: `Project "${project.title}" has been deleted or archived.`,
      relatedEntity: { entityType: 'project', entityId: project._id },
    }).catch(err => console.error('Notification failed:', err));
  });

  await project.deleteOne();
  res.status(200).json({ status: 'success', message: "Project deleted successfully", data: null });
});

// Get Projects for User
exports.getUserProjects = catchAsync(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const projects = await Project.find({
    company: req.companyId,
    $or: [{ owner: userId }, { team: userId }],
  })
    .populate("team", "name email avatar")
    .populate("owner", "name email avatar");

  res.status(200).json({ status: 'success', data: projects });
});