const bot = require("./bot/bot");
const apiServer = require("./api/server");
const startReminderScheduler = require("./schedulers/reminderScheduler");
const startAutoSyncScheduler = require("./schedulers/autoSyncScheduler");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

apiServer.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

bot.launch();
console.log("Entry point loaded, bot should be running...");

//start scheulders
startReminderScheduler(bot);
startAutoSyncScheduler(bot);

process.once("SIGINT", () => {
  console.log("Stopping bot...");
  bot.stop("SIGINT");
  process.exit(0);
});

process.once("SIGTERM", () => {
  console.log("Stopping bot...");
  bot.stop("SIGTERM");
  process.exit(0);
});
