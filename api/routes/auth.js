const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/token - Generate JWT token
router.post("/token", authController.generateToken);

// POST /api/auth/verify - Verify JWT token
router.post("/verify", authController.verifyToken);

module.exports = router;
