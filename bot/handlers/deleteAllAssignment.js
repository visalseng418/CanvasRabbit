const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleDeleteAllAssignments(bot) {
  bot.command("deleteall", async (ctx) => {
    try {
      // Check if there are assignments to delete
      const checkResponse = await axios.get(
        `${API_URL}/assignments/${ctx.chat.id}`,
      );

      if (checkResponse.data.data.length === 0) {
        return ctx.reply("❌ No assignments found");
      }

      ctx.session = { confirmDeleteAll: true };

      ctx.reply(
        "⚠️ This will delete *ALL* your assignments.\n\n" +
          "Type `CONFIRM` to proceed or anything else to cancel.",
        { parse_mode: "Markdown" },
      );
    } catch (error) {
      console.error("Error checking assignments:", error.message);
      ctx.reply("❌ Error checking assignments");
    }
  });

  bot.on("text", async (ctx, next) => {
    if (!ctx.session?.confirmDeleteAll) return next();

    if (ctx.message.text !== "CONFIRM") {
      ctx.session = null;
      return ctx.reply("❎ Delete all cancelled");
    }

    try {
      // Call API to delete all assignments
      const response = await axios.delete(
        `${API_URL}/assignments/all/${ctx.chat.id}`,
      );

      ctx.session = null;

      if (response.data.success) {
        ctx.reply(`🗑️ Deleted ${response.data.data.count} assignment(s)`);
      } else {
        ctx.reply("❌ No assignments found");
      }
    } catch (error) {
      ctx.session = null;

      if (error.response && error.response.status === 404) {
        ctx.reply("❌ No assignments found");
      } else {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Failed to delete assignments");
      }
    }
  });
}

module.exports = handleDeleteAllAssignments;
