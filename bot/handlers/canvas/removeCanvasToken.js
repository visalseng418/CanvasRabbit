const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleRemoveCanvasToken(bot) {
  bot.command("removecanvas", async (ctx) => {
    try {
      // Call API to remove Canvas token
      const response = await axios.delete(
        `${API_URL}/canvas/token/${ctx.chat.id}`,
      );

      if (response.data.success) {
        ctx.reply(
          "✅ Canvas integration removed!\n\n" +
            "• Your Canvas token has been deleted\n" +
            "• Existing assignments will remain\n" +
            "• Use `/setcanvas` to reconnect anytime",
        );
      } else {
        ctx.reply("❌ No Canvas integration found to remove");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        ctx.reply("❌ No Canvas integration found to remove");
      } else {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Failed to remove Canvas integration");
      }
    }
  });
}

module.exports = handleRemoveCanvasToken;
