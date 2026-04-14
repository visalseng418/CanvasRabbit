const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleSetCanvasToken(bot) {
  bot.command("setcanvas", async (ctx) => {
    const parts = ctx.message.text.split(" ");

    if (parts.length < 2) {
      return ctx.reply(
        "⚙️ *Setup Canvas Integration*\n\n" +
          "Usage: `/setcanvas <canvastoken>`\n\n" +
          "*Example:*\n" +
          "`/setcanvas your_token_here`\n\n" +
          "*How to get your token:*\n" +
          "1. Go to Canvas → Account → Settings\n" +
          "2. Click '+ New Access Token'\n" +
          "3. Copy the token and paste it here\n\n" +
          "⚠️ Keep your token private!",
        { parse_mode: "Markdown" },
      );
    }

    const token = parts[1];
    const username = ctx.from.username || "No username";
    const firstName = ctx.from.first_name;
    const userId = ctx.from.id;

    try {
      // Call API to save Canvas token
      const response = await axios.post(`${API_URL}/canvas/token`, {
        chatId: ctx.chat.id,
        token: token,
      });

      if (response.data.success) {
        // Log user info
        console.log(
          `✅ Canvas configured by @${username} (${firstName}, ID: ${userId})`,
        );

        // Delete the message containing the token for security
        ctx.deleteMessage(ctx.message.message_id).catch(() => {});

        ctx.reply(
          "✅ Canvas integration configured!\n\n" +
            "Use `/sync` to import your assignments.",
        );
      } else {
        ctx.reply("❌ Failed to save Canvas token");
      }
    } catch (error) {
      console.error("Error calling API:", error.message);
      ctx.reply("❌ Failed to save Canvas token");
    }
  });
}

module.exports = handleSetCanvasToken;
