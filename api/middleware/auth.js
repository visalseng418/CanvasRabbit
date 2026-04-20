const jwtService = require("../services/jwtService");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  console.log("🔍 [AUTH] Full headers:", req.headers);
  console.log("🔍 [AUTH] Auth header:", authHeader);

  const token = authHeader && authHeader.split(" ")[1];

  console.log(
    "🔍 [AUTH] Extracted token:",
    token ? token.substring(0, 20) + "..." : "No token",
  );

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  // Verify token
  const result = jwtService.verifyToken(token);
  console.log("🔍 [AUTH] Token verification:", result);
  if (!result.valid) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }

  // Attach user info to request
  req.user = {
    chatId: result.payload.chatId,
    username: result.payload.username,
    type: result.payload.type,
  };
  console.log("✅ [AUTH] Authenticated user:", req.user.chatId);
  next();
};

exports.verifyChatIdOwnership = (req, res, next) => {
  const tokenChatId = req.user.chatId;
  const requestChatId = req.params.chatId || req.body.chatId;

  if (!requestChatId) {
    return res.status(400).json({
      success: false,
      error: "chatId required in request",
    });
  }

  if (tokenChatId !== requestChatId.toString()) {
    return res.status(403).json({
      success: false,
      error: "Forbidden: Cannot access other users data",
    });
  }

  next();
};
