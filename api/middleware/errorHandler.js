module.exports = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Database errors
  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(400).json({
      success: false,
      error: "Database constraint violation",
    });
  }

  // Canvas API errors
  if (err.message && err.message.includes("Canvas")) {
    return res.status(502).json({
      success: false,
      error: "Failed to connect to Canvas API",
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
};
