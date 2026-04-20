const axios = require("axios");
const { getOrCreateToken } = require("../../utils/tokenManager");
const API_URL = process.env.API_URL || "http://localhost:3000/api";

function handleAddAssignment(bot) {
  bot.command("add", (ctx) => {
    ctx.session = { awaitingTitle: true };
    ctx.reply("📝 What is the assignment title?");
  });

  bot.on("text", async (ctx, next) => {
    if (!ctx.session) return next();

    // Handle title input
    if (ctx.session.awaitingTitle) {
      ctx.session.title = ctx.message.text;
      ctx.session.awaitingTitle = false;
      ctx.session.awaitingDueDate = true;
      return ctx.reply("📅 Enter due date (MM-DD HH:mm):");
    }

    // Handle due date input
    if (ctx.session.awaitingDueDate) {
      const dateInput = ctx.message.text;
      const dueTime = parseDueDate(dateInput);

      if (!dueTime) {
        ctx.session = null;
        return ctx.reply(
          "❌ Invalid date format. Use MM-DD HH:mm\n\nTry /add again",
        );
      }

      try {
        const token = await getOrCreateToken(ctx.chat.id, ctx.from.username);

        const response = await axios.post(
          `${API_URL}/assignments`,
          {
            chatId: ctx.chat.id,
            title: ctx.session.title,
            dueTime: dueTime,
            canvasId: 0,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          ctx.reply(
            `✅ Assignment added!\n\n` +
              `ID: ${response.data.data.id}\n` +
              `Title: ${ctx.session.title}`,
          );
        } else {
          ctx.reply("❌ Failed to add assignment");
        }
      } catch (error) {
        console.error("Error calling API:", error.message);
        ctx.reply("❌ Failed to add assignment");
      }

      ctx.session = null;
    } else {
      return next();
    }
  });
}

function parseDueDate(input) {
  try {
    const [datePart, timePart] = input.split(" ");
    const [month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const now = new Date();
    const year = now.getFullYear();
    const dueDate = new Date(year, month - 1, day, hour, minute);

    if (dueDate < now) {
      dueDate.setFullYear(year + 1);
    }

    return dueDate.getTime();
  } catch (error) {
    return null;
  }
}

module.exports = handleAddAssignment;
