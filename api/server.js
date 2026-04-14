const express = require("express");
const assignmentRoutes = require("./routes/assignments");
const canvasRoutes = require("./routes/canvas");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api/canvas", canvasRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;
