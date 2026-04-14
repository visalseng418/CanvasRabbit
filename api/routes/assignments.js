const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");

// GET /api/assignments/chat-ids - Get all unique chat IDs
router.get("/chat-ids", assignmentController.getAllChatIds);

// GET /api/assignments/:chatId/reminders - Get assignments for reminders
router.get(
  "/:chatId/reminders",
  assignmentController.getAssignmentsForReminders,
);

// GET /api/assignments/:chatId - List all assignments
router.get("/:chatId", assignmentController.getAssignments);

// POST /api/assignments - Create assignment
router.post("/", assignmentController.createAssignment);

// PATCH /api/assignments/:id/reminder - Update reminder status
router.patch("/:id/reminder", assignmentController.updateReminderStatus);

// DELETE /api/assignments/:id - Delete assignment
router.delete("/:id", assignmentController.deleteAssignment);

// DELETE /api/assignments/all/:chatId - Delete all assignments
router.delete("/all/:chatId", assignmentController.deleteAllAssignments);

module.exports = router;
