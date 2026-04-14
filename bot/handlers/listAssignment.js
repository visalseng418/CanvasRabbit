const axios = require("axios");
const { formatDate } = require("../../utils/dateUtils");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleListAssignments(bot) {
  bot.command("list", async (ctx) => {
    try {
      // Call API instead of directly querying DB
      const response = await axios.get(`${API_URL}/assignments/${ctx.chat.id}`);

      if (!response.data.success) {
        return ctx.reply("❌ Error fetching assignments");
      }

      const assignments = response.data.data;

      if (assignments.length === 0) {
        return ctx.reply("📭 No upcoming assignments");
      }

      let msg = "📄 Your Assignments:\n\n";
      assignments.forEach((a) => {
        msg += `ID: ${a.id} | ${a.title} | Due: ${formatDate(a.due_time)}\n`;
      });

      ctx.reply(msg);
    } catch (error) {
      console.error("Error calling API:", error.message);
      ctx.reply("❌ Error fetching assignments");
    }
  });
}

module.exports = handleListAssignments;
