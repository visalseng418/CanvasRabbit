const cron = require("node-cron");
const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3000/api";

async function getAllCanvasTokens() {
  try {
    // We need a new API endpoint for this
    const response = await axios.get(`${API_URL}/canvas/tokens`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching canvas tokens:", error.message);
    return [];
  }
}

async function syncUserAssignments(chatId) {
  try {
    const response = await axios.post(`${API_URL}/canvas/sync`, { chatId });
    return response.data;
  } catch (error) {
    console.error(`Error syncing for user ${chatId}:`, error.message);
    return { success: false };
  }
}

function startAutoSyncScheduler(bot) {
  // Run every 24 hours at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 [AUTO-SYNC] Starting daily auto-sync for all users...");
    const startTime = Date.now();

    try {
      const users = await getAllCanvasTokens();

      if (!users || users.length === 0) {
        console.log("ℹ️ [AUTO-SYNC] No users with Canvas tokens found.");
        return;
      }

      console.log(`📊 [AUTO-SYNC] Found ${users.length} user(s) to sync`);

      let totalSynced = 0;
      let totalFailed = 0;

      for (const user of users) {
        console.log(`\n🔄 [AUTO-SYNC] Syncing user ${user.chat_id}...`);

        const result = await syncUserAssignments(user.chat_id);

        if (result.success) {
          const { imported, skipped, total } = result.data;
          console.log(
            `   ✅ User ${user.chat_id}: Imported ${imported}, Skipped ${skipped}, Total ${total}`,
          );
          totalSynced++;
        } else {
          console.log(`   ❌ User ${user.chat_id}: Sync failed`);
          totalFailed++;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✨ [AUTO-SYNC] Complete! Duration: ${duration}s`);
      console.log(`   ✅ Successful: ${totalSynced}`);
      console.log(`   ❌ Failed: ${totalFailed}`);
      console.log(`   📊 Total users: ${users.length}`);
    } catch (error) {
      console.error("❌ [AUTO-SYNC] Error:", error.message);
    }
  });

  console.log("⏰ Auto-sync scheduler started (runs daily at midnight)");
}

module.exports = startAutoSyncScheduler;
