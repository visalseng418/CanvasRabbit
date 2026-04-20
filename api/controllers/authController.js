const jwtService = require("../services/jwtService");

// Generate JWT token for a Telegram user
exports.generateToken = async (req, res, next) => {
  try {
    const { chatId, username } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        error: "chatId is required",
      });
    }

    // Generate token
    const token = jwtService.generateToken(chatId, username);

    res.status(200).json({
      success: true,
      data: {
        token,
        expiresIn: "24h",
        tokenType: "Bearer",
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify token endpoint (for testing)
exports.verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "token is required",
      });
    }

    const result = jwtService.verifyToken(token);

    if (!result.valid) {
      return res.status(403).json({
        success: false,
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        payload: result.payload,
      },
    });
  } catch (error) {
    next(error);
  }
};
