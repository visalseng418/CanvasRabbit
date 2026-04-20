const axios = require("axios");
const { formatDate } = require("../../utils/dateUtils");
const { getOrCreateToken } = require("../../utils/tokenManager");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleListAssignments(bot) {
  bot.command("list", async (ctx) => {
    try {
      const token = await getOrCreateToken(ctx.chat.id, ctx.from.username);

      const response = await axios.get(
        `${API_URL}/assignments/${ctx.chat.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success) {
        return ctx.reply("❌ Error fetching assignments");
      }

      const assignments = response.data.data;

      if (assignments.length === 0) {
        return ctx.reply("📭 No upcoming assignments");
      }

      let msg = "📄 Your Assignments:\n\n";
      assignments.forEach((a) => {
        const status = a.completed === 1 ? "✅" : "⏳";
        msg += `${status} ID: ${a.id} | ${a.title} | Due: ${formatDate(a.due_time)}\n`;
      });

      msg += "\n💡 Tip: Use `/done <id>` to mark as completed";

      ctx.reply(msg);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        ctx.reply("❌ Authentication failed. Please try again.");
      } else if (error.response && error.response.status === 403) {
        ctx.reply("❌ Access forbidden.");
      } else {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Error fetching assignments");
      }
    }
  });
}

module.exports = handleListAssignments;
