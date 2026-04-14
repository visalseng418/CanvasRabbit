require("dotenv").config();
const db = require("../configs/db");

// Test chat ID (use your actual Telegram chat ID)
const TEST_CHAT_ID = "1659801509"; // Replace with your chat ID

function addMockData() {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const fiveMinutes = 5 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const fiveHours = 5 * 60 * 60 * 1000;
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const mockAssignments = [
    // Due in ~5 minutes (should trigger 5h reminder immediately)
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 5 Minutes",
      due_time: now + fiveMinutes,
      canvas_id: 0,
      reminded_1d: 1, // Already sent 1d reminder
      reminded_5h: 0, // Haven't sent 5h reminder yet
    },

    // Due in ~1 hour (should trigger 5h reminder)
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 1 Hour",
      due_time: now + oneHour,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 0,
    },

    // Due in ~5 hours (should trigger 5h reminder)
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 5 Hours",
      due_time: now + fiveHours,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 0,
    },

    // Due in ~24 hours (should trigger 1d reminder)
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 24 Hours",
      due_time: now + twentyFourHours,
      canvas_id: 0,
      reminded_1d: 0,
      reminded_5h: 0,
    },

    // Due in 48 hours (no reminder yet)
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 48 Hours",
      due_time: now + twentyFourHours * 2,
      canvas_id: 0,
      reminded_1d: 0,
      reminded_5h: 0,
    },

    // Already passed (should be cleaned up)
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Expired Assignment",
      due_time: now - oneHour,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 1,
    },
  ];

  console.log("🧪 Adding mock test data...\n");

  mockAssignments.forEach((assignment, index) => {
    db.run(
      `INSERT INTO assignments (chat_id, title, due_time, canvas_id, reminded_1d, reminded_5h)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        assignment.chat_id,
        assignment.title,
        assignment.due_time,
        assignment.canvas_id,
        assignment.reminded_1d,
        assignment.reminded_5h,
      ],
      function (err) {
        if (err) {
          console.error(
            `❌ Error adding assignment ${index + 1}:`,
            err.message,
          );
        } else {
          const dueDate = new Date(assignment.due_time);
          const timeUntilDue = Math.round(
            (assignment.due_time - now) / (60 * 1000),
          );
          console.log(`✅ Added: ${assignment.title}`);
          console.log(`   Due: ${dueDate.toLocaleString()}`);
          console.log(`   Time until due: ${timeUntilDue} minutes`);
          console.log(
            `   reminded_1d: ${assignment.reminded_1d}, reminded_5h: ${assignment.reminded_5h}\n`,
          );
        }
      },
    );
  });

  // Wait a bit for all inserts to complete
  setTimeout(() => {
    console.log("✨ Mock data added! Check your assignments with /list\n");
    console.log(
      "📝 To get your chat ID, send any message to your bot and check the console logs.\n",
    );
    process.exit(0);
  }, 1000);
}

// Run the script
addMockData();
