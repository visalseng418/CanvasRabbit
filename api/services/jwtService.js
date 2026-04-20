const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const JWT_EXPIRES_IN = "24h"; // Token valid for 24 hours

// Generate JWT for a Telegram user
exports.generateToken = (chatId, username = null) => {
  const payload = {
    chatId: chatId.toString(),
    username: username,
    type: "bot-user",
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      payload: decoded,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};

// Extract chatId from token
exports.getChatIdFromToken = (token) => {
  const result = this.verifyToken(token);
  if (result.valid) {
    return result.payload.chatId;
  }
  return null;
};
