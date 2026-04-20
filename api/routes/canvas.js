const express = require("express");
const router = express.Router();
const canvasController = require("../controllers/canvasController");
const {
  authenticateToken,
  verifyChatIdOwnership,
} = require("../middleware/auth");

// GET /api/canvas/tokens - Get all Canvas tokens (for scheduler)
router.get("/tokens", authenticateToken, canvasController.getAllTokens);

// POST /api/canvas/token - Save Canvas token
router.post("/token", canvasController.saveToken);

// POST /api/canvas/sync - Sync assignments from Canvas

router.post("/sync", authenticateToken, canvasController.syncAssignments);

// DELETE /api/canvas/token/:chatId - Remove Canvas token
router.delete(
  "/token/:chatId",
  authenticateToken,
  verifyChatIdOwnership,
  canvasController.removeToken,
);

module.exports = router;
