const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleSyncCanvas(bot) {
  bot.command("sync", async (ctx) => {
    try {
      ctx.reply("🔄 Syncing assignments from Canvas...");

      // Call API to sync assignments
      const response = await axios.post(`${API_URL}/canvas/sync`, {
        chatId: ctx.chat.id,
      });

      if (response.data.success) {
        const { imported, skipped, total } = response.data.data;

        ctx.reply(
          `✅ Sync complete!\n\n` +
            `📥 Imported: ${imported}\n` +
            `⏭️ Skipped: ${skipped} (already exists)\n` +
            `📚 Total: ${total}`,
        );
      } else {
        ctx.reply(response.data.error || "❌ Failed to sync");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        ctx.reply(
          "❌ Canvas not configured.\n\n" +
            "Use `/setcanvas <token>` to setup Canvas integration first.",
        );
      } else {
        console.error("Sync error:", error.message);
        ctx.reply(
          "❌ Failed to sync with Canvas.\n\n" +
            "Please check:\n" +
            "• Your Canvas token is valid\n" +
            "• Your Canvas domain is correct\n" +
            "• You have access to your courses",
        );
      }
    }
  });
}

module.exports = handleSyncCanvas;
