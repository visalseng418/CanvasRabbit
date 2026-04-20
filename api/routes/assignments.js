const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const {
  authenticateToken,
  verifyChatIdOwnership,
} = require("../middleware/auth");

router.use(authenticateToken);

// GET /api/assignments/chat-ids - Get all unique chat IDs
router.get("/chat-ids", assignmentController.getAllChatIds);

// GET /api/assignments/:chatId/reminders - Get assignments for reminders
router.get(
  "/:chatId/reminders",
  verifyChatIdOwnership,
  assignmentController.getAssignmentsForReminders,
);

// GET /api/assignments/:chatId - List all assignments
router.get(
  "/:chatId",
  verifyChatIdOwnership,
  assignmentController.getAssignments,
);

// POST /api/assignments - Create assignment
router.post("/", assignmentController.createAssignment);

// PATCH /api/assignments/:id/reminder - Update reminder status
router.patch("/:id/reminder", assignmentController.updateReminderStatus);

// PATCH /api/assignments/:id/complete - Mark as completed
router.patch("/:id/complete", assignmentController.markComplete);

// PATCH /api/assignments/:id/incomplete - Mark as incomplete
router.patch("/:id/incomplete", assignmentController.markIncomplete);

// DELETE /api/assignments/:id - Delete assignment
router.delete("/:id", assignmentController.deleteAssignment);

// DELETE /api/assignments/all/:chatId - Delete all assignments
router.delete(
  "/all/:chatId",
  verifyChatIdOwnership,
  assignmentController.deleteAllAssignments,
);

module.exports = router;
