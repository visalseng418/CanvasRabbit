const dbService = require("../services/dbService");
const CanvasService = require("../services/canvasService");

// POST - Save Canvas token
exports.saveToken = async (req, res, next) => {
  try {
    const { chatId, token } = req.body;

    if (!chatId || !token) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: chatId, token",
      });
    }

    await dbService.saveCanvasToken(chatId, token);

    res.status(201).json({
      success: true,
      message: "Canvas token saved",
    });
  } catch (error) {
    next(error);
  }
};

// POST - Sync assignments from Canvas
exports.syncAssignments = async (req, res, next) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: chatId",
      });
    }

    // Get user's Canvas token
    const tokenData = await dbService.getCanvasToken(chatId);

    if (!tokenData || !tokenData.canvas_token) {
      return res.status(404).json({
        success: false,
        error: "Canvas not configured. Please set token first.",
      });
    }

    // Fetch assignments from Canvas
    const canvas = new CanvasService(tokenData.canvas_token);
    const assignments = await canvas.getAllAssignments();

    if (assignments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming assignments found in Canvas",
        data: { imported: 0, skipped: 0, total: 0 },
      });
    }

    let imported = 0;
    let skipped = 0;

    for (const assignment of assignments) {
      const dueTime = assignment.dueDate.getTime();
      const title = `[${assignment.course}] ${assignment.title}`;

      // Check if assignment already exists
      const existing = await dbService.getAssignmentsByChatId(chatId);
      const isDuplicate = existing.some(
        (a) => a.title === title && a.due_time === dueTime,
      );

      if (isDuplicate) {
        skipped++;
        continue;
      }

      // Insert new assignment
      await dbService.createAssignment({
        chatId,
        title,
        dueTime,
        canvasId: assignment.id,
      });

      imported++;
    }

    // Update last sync time
    await dbService.updateLastSync(chatId, Date.now());

    res.status(200).json({
      success: true,
      message: "Sync complete",
      data: {
        imported,
        skipped,
        total: assignments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE - Remove Canvas token
exports.removeToken = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const deleted = await dbService.deleteCanvasToken(chatId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "No Canvas integration found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Canvas integration removed",
    });
  } catch (error) {
    next(error);
  }
};

// GET - Get all Canvas tokens (for auto-sync scheduler)
exports.getAllTokens = async (req, res, next) => {
  try {
    const tokens = await dbService.getAllCanvasTokensWithDetails();

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};
