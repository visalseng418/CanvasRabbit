const axios = require("axios");
const { getOrCreateToken } = require("../../utils/tokenManager");
const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleIncompleteAssignment(bot) {
  bot.command("incomplete", async (ctx) => {
    const text = ctx.message.text.split(" ")[1];

    if (!text) {
      return ctx.reply("❌ Usage: /incomplete <assignment_id>");
    }

    const id = parseInt(text);

    if (isNaN(id)) {
      return ctx.reply("❌ Invalid ID");
    }

    try {
      const token = await getOrCreateToken(ctx.chat.id, ctx.from.username);

      const response = await axios.patch(
        `${API_URL}/assignments/${id}/incomplete`,
        {
          chatId: ctx.chat.id,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        const assignment = response.data.data;
        ctx.reply(
          `🔄 Marked as incomplete!\n\n` +
            `ID: ${assignment.id}\n` +
            `Title: ${assignment.title}\n\n` +
            `Reminders are now active again for this assignment.`,
        );
      } else {
        ctx.reply("❌ Assignment not found or not completed");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        ctx.reply(error.response.data.error || "❌ Assignment not found");
      } else {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Error marking assignment as incomplete");
      }
    }
  });
}

module.exports = handleIncompleteAssignment;
