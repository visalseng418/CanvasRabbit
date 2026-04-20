const dbService = require("../services/dbService");

exports.getAssignments = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const now = Date.now();

    // Delete expired assignments first
    await dbService.deleteExpiredAssignments(chatId, now);

    // Get remaining assignments
    const assignments = await dbService.getAssignmentsByChatId(chatId);

    if (assignments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming assignments",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { chatId, title, dueTime, canvasId } = req.body;

    // Validation
    if (!chatId || !title || !dueTime) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: chatId, title, dueTime",
      });
    }

    const assignment = await dbService.createAssignment({
      chatId,
      title,
      dueTime,
      canvasId: canvasId || 0,
    });

    res.status(201).json({
      success: true,
      message: "Assignment created",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: chatId",
      });
    }

    const result = await dbService.deleteAssignment(id, chatId);

    if (!result.deleted) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted",
      data: result.assignment,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAllAssignments = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const count = await dbService.deleteAllAssignments(chatId);

    if (count === 0) {
      return res.status(404).json({
        success: false,
        error: "No assignments found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${count} assignment(s)`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReminderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chatId, reminderType } = req.body;

    if (!chatId || !reminderType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: chatId, reminderType",
      });
    }

    if (!["1d", "5h"].includes(reminderType)) {
      return res.status(400).json({
        success: false,
        error: 'reminderType must be "1d" or "5h"',
      });
    }

    await dbService.updateReminderStatus(id, chatId, reminderType);

    res.status(200).json({
      success: true,
      message: "Reminder status updated",
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllChatIds = async (req, res, next) => {
  try {
    const chatIds = await dbService.getAllChatIds();

    res.status(200).json({
      success: true,
      data: chatIds,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAssignmentsForReminders = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const assignments = await dbService.getAssignmentsForReminders(chatId);

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

exports.markComplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: chatId",
      });
    }

    const result = await dbService.markAssignmentComplete(id, chatId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment marked as complete",
      data: result.assignment,
    });
  } catch (error) {
    next(error);
  }
};

exports.markIncomplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: chatId",
      });
    }

    const result = await dbService.markAssignmentIncomplete(id, chatId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment marked as incomplete",
      data: result.assignment,
    });
  } catch (error) {
    next(error);
  }
};
