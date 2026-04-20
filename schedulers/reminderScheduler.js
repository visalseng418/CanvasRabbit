const cron = require("node-cron");
const axios = require("axios");
const { formatTime } = require("../utils/dateUtils");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

async function getChatIds() {
  try {
    const response = await axios.get(`${API_URL}/assignments/chat-ids`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching chat IDs:", error.message);
    return [];
  }
}

async function getAssignmentsForReminders(chatId) {
  try {
    const response = await axios.get(
      `${API_URL}/assignments/${chatId}/reminders`,
    );
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching assignments for reminders:", error.message);
    return [];
  }
}

async function updateReminderStatus(assignmentId, chatId, reminderType) {
  try {
    await axios.patch(`${API_URL}/assignments/${assignmentId}/reminder`, {
      chatId,
      reminderType,
    });
  } catch (error) {
    console.error("Error updating reminder status:", error.message);
  }
}

function startReminderScheduler(bot) {
  cron.schedule("* * * * *", async () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const fiveHours = 5 * 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    try {
      const chatIds = await getChatIds();

      for (const chatId of chatIds) {
        const assignments = await getAssignmentsForReminders(chatId);

        for (const a of assignments) {
          // ✅ SKIP COMPLETED ASSIGNMENTS
          if (a.completed === 1) {
            continue;
          }

          const timeLeft = a.due_time - now;

          // 🔔 1-DAY REMINDER
          if (
            a.due_time > now &&
            timeLeft <= oneDay &&
            timeLeft > oneDay - oneMinute &&
            a.reminded_1d === 0
          ) {
            const formattedTimeLeft = formatTime(timeLeft);

            try {
              await bot.telegram.sendMessage(
                a.chat_id,
                `📅 Reminder!\n"${a.title}" is due in ${formattedTimeLeft}`,
              );

              await updateReminderStatus(a.id, a.chat_id, "1d");
            } catch (error) {
              console.error(
                `Failed to send 1d reminder for assignment ${a.id}:`,
                error.message,
              );
            }
          }

          // 🔔 5-HOUR REMINDER
          if (
            a.due_time > now &&
            timeLeft <= fiveHours &&
            a.reminded_5h === 0
          ) {
            const formattedTimeLeft = formatTime(timeLeft);

            try {
              await bot.telegram.sendMessage(
                a.chat_id,
                `📅 Reminder!!!!!!!\n"${a.title}" is due in ${formattedTimeLeft}!`,
              );

              await updateReminderStatus(a.id, a.chat_id, "5h");
            } catch (error) {
              console.error(
                `Failed to send 5h reminder for assignment ${a.id}:`,
                error.message,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error.message);
    }
  });

  console.log("⏰ Reminder scheduler started (runs every minute)");
}

module.exports = startReminderScheduler;
