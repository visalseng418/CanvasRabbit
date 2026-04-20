require("dotenv").config();
const db = require("../configs/db");

const TEST_CHAT_ID = "1659801509";

function addMockData() {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const fiveMinutes = 5 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const fiveHours = 5 * 60 * 60 * 1000;
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const mockAssignments = [
    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 5 Minutes",
      due_time: now + fiveMinutes,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 0,
      completed: 0,
    },

    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 1 Hour",
      due_time: now + oneHour,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 0,
      completed: 0,
    },

    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 5 Hours (COMPLETED)",
      due_time: now + fiveHours,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 0,
      completed: 1,
    },

    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 24 Hours",
      due_time: now + twentyFourHours,
      canvas_id: 0,
      reminded_1d: 0,
      reminded_5h: 0,
      completed: 0,
    },

    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Assignment Due in 48 Hours",
      due_time: now + twentyFourHours * 2,
      canvas_id: 0,
      reminded_1d: 0,
      reminded_5h: 0,
      completed: 0,
    },

    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Expired Assignment",
      due_time: now - oneHour,
      canvas_id: 0,
      reminded_1d: 1,
      reminded_5h: 1,
      completed: 0,
    },

    {
      chat_id: TEST_CHAT_ID,
      title: "[TEST] Already Completed Assignment",
      due_time: now + twentyFourHours * 3,
      canvas_id: 0,
      reminded_1d: 0,
      reminded_5h: 0,
      completed: 1,
    },
  ];

  console.log("🧪 Adding mock test data...\n");

  mockAssignments.forEach((assignment, index) => {
    db.run(
      `INSERT INTO assignments (chat_id, title, due_time, canvas_id, reminded_1d, reminded_5h, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        assignment.chat_id,
        assignment.title,
        assignment.due_time,
        assignment.canvas_id,
        assignment.reminded_1d,
        assignment.reminded_5h,
        assignment.completed,
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
          const status =
            assignment.completed === 1 ? "✅ COMPLETED" : "⏳ PENDING";
          console.log(`✅ Added: ${assignment.title}`);
          console.log(`   Status: ${status}`);
          console.log(`   Due: ${dueDate.toLocaleString()}`);
          console.log(`   Time until due: ${timeUntilDue} minutes`);
          console.log(
            `   reminded_1d: ${assignment.reminded_1d}, reminded_5h: ${assignment.reminded_5h}\n`,
          );
        }
      },
    );
  });

  setTimeout(() => {
    console.log("✨ Mock data added! Check your assignments with /list\n");
    console.log("📝 Test commands:");
    console.log("   /list - View all assignments (see ✅ vs ⏳ status)");
    console.log("   /done <id> - Mark an assignment as completed");
    console.log("   /undone <id> - Mark an assignment as incomplete\n");
    process.exit(0);
  }, 1000);
}

addMockData();
