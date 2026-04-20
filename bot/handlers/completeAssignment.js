const axios = require("axios");
const { getOrCreateToken } = require("../../utils/tokenManager");
const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleCompleteAssignment(bot) {
  bot.command("complete", async (ctx) => {
    const text = ctx.message.text.split(" ")[1];

    if (!text) {
      return ctx.reply("❌ Usage: /complete <assignment_id>");
    }

    const id = parseInt(text);

    if (isNaN(id)) {
      return ctx.reply("❌ Invalid ID");
    }

    try {
      const token = await getOrCreateToken(ctx.chat.id, ctx.from.username);

      const response = await axios.patch(
        `${API_URL}/assignments/${id}/complete`,
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
          `✅ Marked as complete!\n\n` +
            `ID: ${assignment.id}\n` +
            `Title: ${assignment.title}\n\n` +
            `You won't receive reminders for this assignment anymore.`,
        );
      } else {
        ctx.reply("❌ Assignment not found");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        ctx.reply(error.response.data.error || "❌ Assignment not found");
      } else {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Error marking assignment as complete");
      }
    }
  });
}

module.exports = handleCompleteAssignment;
