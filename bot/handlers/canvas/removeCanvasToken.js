const axios = require("axios");
const { getOrCreateToken } = require("../../../utils/tokenManager");
const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleRemoveCanvasToken(bot) {
  bot.command("removecanvas", async (ctx) => {
    try {
      const token = await getOrCreateToken(ctx.chat.id, ctx.from.username);

      const response = await axios.delete(
        `${API_URL}/canvas/token/${ctx.chat.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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
