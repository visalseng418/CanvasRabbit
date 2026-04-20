const express = require("express");
const assignmentRoutes = require("./routes/assignments");
const canvasRoutes = require("./routes/canvas");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/canvas", canvasRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
