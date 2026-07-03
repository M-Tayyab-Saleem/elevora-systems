const Expense = require("../models/Expense");
const User = require("../models/userSchema");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/ExpressError");
const { cloudinary } = require('../config/cloudinaryConfig');
const { getSearchScope } = require("../utils/rbac");
const { getTeamIds } = require("../utils/hierarchy");
const { createNotification } = require('../utils/notificationService');
const APIFeatures = require("../utils/apiFeatures");
const { normalizeRole } = require("../utils/rbacUtils");

class ExpenseService {
  async createExpense(user, companyId, data, file) {
    if (!file) throw new BadRequestError("Receipt is required");
    const { title, description, amount, category } = data;

    if (!title || !amount || !category) {
      if (file && (file.filename || file.public_id)) {
        try {
          await cloudinary.uploader.destroy(file.filename || file.public_id);
        } catch (err) {
          console.error("Failed to cleanup Cloudinary blob after validation failure:", err);
        }
      }
      throw new BadRequestError("Please provide all required fields");
    }

    const submitter = await User.findById(user._id);
    if (!submitter) throw new NotFoundError("User");

    const expense = await Expense.create({
      title,
      description: description || "",
      amount: parseFloat(amount),
      category,
      receiptUrl: file.url || file.path,
      receiptPublicId: file.blobName || file.filename,
      blobName: file.blobName,
      submittedBy: user._id,
      company: companyId,
      submittedByName: submitter.name,
    });

    try {
      const notifyRecipients = await User.find({
        $or: [
          { _id: submitter.reportsTo },
          { role: 'Admin' },
          { role: 'Super Admin' }
        ]
      });

      notifyRecipients.forEach(recipient => {
        if (recipient._id.toString() !== user._id.toString()) {
          createNotification({
            recipient: recipient._id,
            type: 'EXPENSE_SUBMITTED',
            title: 'New Expense Submitted',
            message: `${submitter.name} submitted a new expense: "${expense.title}" for $${expense.amount}.`,
            relatedEntity: { entityType: 'expense', entityId: expense._id },
          }).catch(err => console.error('[Notification Error] Expense submission:', err.message));
        }
      });
    } catch (err) {
      console.error('[Notification Error] Failed to fetch recipients for expense:', err.message);
    }

    return expense;
  }

  async getAllExpenses(user, companyId, query) {
    const scope = await getSearchScope(user, "expense");
    scope.company = companyId;
    
    const features = new APIFeatures(Expense.find(scope), query)
      .filter()
      .search(['title', 'description', 'submittedByName', 'category'])
      .sort()
      .limitFields()
      .paginate();

    const expenses = await features.query;
    const totalCount = await Expense.countDocuments(scope);

    return {
      total: totalCount,
      count: expenses.length,
      page: query.page * 1 || 1,
      limit: query.limit * 1 || 100,
      data: expenses,
    };
  }

  async getPendingExpenses(user, companyId) {
    const userRole = normalizeRole(user.role);
    if (["employee", "technician", "hr"].includes(userRole)) {
      throw new ForbiddenError("You do not have permission to access this resource");
    }

    const scope = await getSearchScope(user, "expense");
    scope.company = companyId;
    return Expense.find({ ...scope, status: "pending" }).sort("-createdAt");
  }

  async getMyExpenses(userId) {
    return Expense.find({ submittedBy: userId }).sort("-createdAt");
  }

  async getExpenseById(user, companyId, id) {
    const expense = await Expense.findOne({ _id: id, company: companyId });
    if (!expense) throw new NotFoundError("Expense");

    const userRole = normalizeRole(user.role);
    if (userRole === "manager" && expense.submittedBy._id.toString() !== user._id.toString()) {
      throw new ForbiddenError("You do not have permission to view this expense");
    }

    return expense;
  }

  async updateExpense(user, companyId, id, data) {
    const expense = await Expense.findOne({ _id: id, company: companyId });
    if (!expense) throw new NotFoundError("Expense");

    const userRole = normalizeRole(user.role);
    const isSuperAdmin = userRole === "superadmin";
    const isOwner = expense.submittedBy._id.toString() === user._id.toString();
    const isPending = expense.status === "pending";

    if (!isSuperAdmin && !(isOwner && isPending)) {
      throw new ForbiddenError("You do not have permission to update this expense");
    }

    const allowedUpdates = ["title", "description", "amount", "category"];
    if (isSuperAdmin) {
      allowedUpdates.push("status", "rejectionReason");
    }

    const updates = {};
    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key];
      }
    });

    if (updates.status === "approved" && isSuperAdmin) {
      updates.approvedBy = user._id;
      updates.approvedByName = user.name;
      updates.approvedAt = Date.now();
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, company: companyId },
      updates,
      { new: true, runValidators: true }
    );

    if (updates.status && updates.status !== expense.status) {
      const type = updates.status === 'approved' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED';
      const title = updates.status === 'approved' ? 'Expense Approved' : 'Expense Rejected';
      const message = updates.status === 'approved'
        ? `Your expense "${updatedExpense.title}" for $${updatedExpense.amount} has been approved.`
        : `Your expense "${updatedExpense.title}" for $${updatedExpense.amount} has been rejected.`;

      createNotification({
        recipient: updatedExpense.submittedBy._id,
        type,
        title,
        message,
        relatedEntity: { entityType: 'expense', entityId: updatedExpense._id },
      }).catch(err => console.error('[Notification Error] Expense update status:', err.message));
    }

    return updatedExpense;
  }

  async approveExpense(user, companyId, id) {
    const userRole = normalizeRole(user.role);
    const currentUserId = user.id || user._id;

    if (["employee", "technician", "hr"].includes(userRole)) {
      throw new ForbiddenError("You do not have permission to approve expenses");
    }

    const expense = await Expense.findOne({ _id: id, company: companyId });
    if (!expense) throw new NotFoundError("Expense");
    if (expense.status !== "pending") throw new BadRequestError("This expense has already been processed");

    if (expense.submittedBy.toString() === currentUserId.toString()) {
      throw new ForbiddenError("You cannot approve your own expense request.");
    }

    if (userRole !== "superadmin") {
      const teamIds = await getTeamIds(currentUserId);
      if (!teamIds.includes(expense.submittedBy.toString())) {
        throw new ForbiddenError("You can only approve expenses for your own team hierarchy.");
      }
    }

    expense.status = "approved";
    expense.approvedBy = currentUserId;
    expense.approvedByName = user.name;
    expense.approvedAt = Date.now();
    await expense.save();

    createNotification({
      recipient: expense.submittedBy._id,
      type: 'EXPENSE_APPROVED',
      title: 'Expense Approved',
      message: `Your expense "${expense.title}" for $${expense.amount} has been approved.`,
      relatedEntity: { entityType: 'expense', entityId: expense._id },
    }).catch(err => console.error('[Notification Error] Expense approved:', err.message));

    return expense;
  }

  async rejectExpense(user, companyId, id, reason) {
    const userRole = normalizeRole(user.role);
    const currentUserId = user.id || user._id;

    if (["employee", "technician", "hr"].includes(userRole)) {
      throw new ForbiddenError("You do not have permission to reject expenses");
    }

    if (!reason) throw new BadRequestError("Rejection reason is required");

    const expense = await Expense.findOne({ _id: id, company: companyId });
    if (!expense) throw new NotFoundError("Expense");
    if (expense.status !== "pending") throw new BadRequestError("This expense has already been processed");

    if (expense.submittedBy.toString() === currentUserId.toString()) {
      throw new ForbiddenError("You cannot reject your own expense request.");
    }

    if (userRole !== "superadmin") {
      const teamIds = await getTeamIds(currentUserId);
      if (!teamIds.includes(expense.submittedBy.toString())) {
        throw new ForbiddenError("You can only reject expenses for your own team hierarchy.");
      }
    }

    expense.status = "rejected";
    expense.rejectionReason = reason;
    expense.rejectedBy = currentUserId;
    expense.rejectedByName = user.name;
    expense.rejectedAt = Date.now();
    await expense.save();

    createNotification({
      recipient: expense.submittedBy._id,
      type: 'EXPENSE_REJECTED',
      title: 'Expense Rejected',
      message: `Your expense "${expense.title}" for $${expense.amount} has been rejected. Reason: ${reason}`,
      relatedEntity: { entityType: 'expense', entityId: expense._id },
    }).catch(err => console.error('[Notification Error] Expense rejected:', err.message));

    return expense;
  }

  async deleteExpense(user, companyId, id) {
    const expense = await Expense.findOne({ _id: id, company: companyId });
    if (!expense) throw new NotFoundError("Expense");

    const userRole = normalizeRole(user.role);
    const isSuperAdmin = userRole === "superadmin";
    const isOwner = expense.submittedBy._id.toString() === user._id.toString();
    const isPending = expense.status === "pending";

    if (!isSuperAdmin && !(isOwner && isPending)) {
      throw new ForbiddenError("You do not have permission to delete this expense");
    }

    if (expense.blobName || expense.receiptPublicId) {
      try {
        await cloudinary.uploader.destroy(expense.receiptPublicId || expense.blobName);
      } catch (err) {
        console.error("Failed to delete expense receipt from Cloudinary:", err);
      }
    }

    await expense.deleteOne();

    if (expense.submittedBy._id.toString() !== user._id.toString()) {
      createNotification({
        recipient: expense.submittedBy._id,
        type: 'EXPENSE_DELETED',
        title: 'Expense Request Deleted',
        message: `Your expense request "${expense.title}" has been deleted by an administrator.`,
        relatedEntity: { entityType: 'expense', entityId: expense._id },
      }).catch(err => console.error('[Notification Error] Expense deleted:', err.message));
    }
  }

  async getExpenseStats(user, companyId) {
    const userRole = normalizeRole(user.role);
    if (["employee", "technician", "hr"].includes(userRole)) {
      throw new ForbiddenError("You do not have permission to view statistics");
    }

    const scope = await getSearchScope(user, "expense");
    scope.company = companyId;

    const stats = await Expense.aggregate([
      { $match: scope },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const pendingCount = stats.find(s => s._id === "pending")?.count || 0;
    const approvedCount = stats.find(s => s._id === "approved")?.count || 0;
    const rejectedCount = stats.find(s => s._id === "rejected")?.count || 0;
    const totalCount = await Expense.countDocuments(scope);
    const totalApproved = stats.find(s => s._id === "approved")?.totalAmount || 0;
    const totalPending = stats.find(s => s._id === "pending")?.totalAmount || 0;

    return {
      total: totalCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      totalApproved,
      totalPending,
      stats,
    };
  }

  async processReceipt(file, documentType) {
    if (!file) throw new BadRequestError("Receipt image is required");
    
    // Cloudinary automatically provides standard fields. Since Document Intelligence is removed,
    // we return a standard fallback structure or rely on user's manual input on the frontend.
    return {
      title: "Extracted Receipt",
      description: "Auto-extraction disabled. Please fill details manually.",
      amount: 0,
      category: "other",
      vendor: "",
      date: new Date().toISOString(),
      currency: "USD",
      items: [],
      subtotal: 0,
      tax: 0,
      tip: 0,
      confidence: 1,
      raw: {}
    };
  }

  async exportExpenses(user, companyId) {
    const userRole = normalizeRole(user.role);
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      throw new ForbiddenError("You do not have permission to export expenses");
    }

    const scope = await getSearchScope(user, "expense");
    scope.company = companyId;
    
    const expenses = await Expense.find(scope)
      .populate('submittedBy', 'name email department')
      .sort('-createdAt');

    let csv = 'Employee,Email,Title,Category,Amount,Date,Status,Created At\n';
    expenses.forEach(e => {
      const emp = e.submittedBy || {};
      csv += `"${emp.name || e.submittedByName}","${emp.email || ''}","${(e.title || '').replace(/"/g, '""')}","${e.category}","${e.amount}","${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''}","${e.status}","${e.createdAt}"\n`;
    });
    return csv;
  }
}

module.exports = new ExpenseService();
