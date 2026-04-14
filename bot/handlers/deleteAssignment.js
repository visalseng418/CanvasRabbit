const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleDeleteAssignment(bot) {
  bot.command("delete", async (ctx) => {
    const text = ctx.message.text.split(" ")[1];

    if (!text) {
      return ctx.reply("❌ Usage: /delete <assignment_id>");
    }

    const id = parseInt(text);

    if (isNaN(id)) {
      return ctx.reply("❌ Invalid ID");
    }

    try {
      // Call API to delete assignment
      const response = await axios.delete(`${API_URL}/assignments/${id}`, {
        data: { chatId: ctx.chat.id },
      });

      if (response.data.success) {
        const assignment = response.data.data;
        ctx.reply(`✅ Assignment ID ${id} | ${assignment.title} deleted`);
      } else {
        ctx.reply("❌ Assignment not found");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        ctx.reply("❌ Assignment not found");
      } else {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Error deleting assignment");
      }
    }
  });
}

module.exports = handleDeleteAssignment;
