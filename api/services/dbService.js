const db = require("../../configs/db");

// Promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ==================== ASSIGNMENTS ====================

exports.getAssignmentsByChatId = async (chatId) => {
  return await dbAll(
    `SELECT id, title, due_time, canvas_id FROM assignments 
     WHERE chat_id = ? 
     ORDER BY due_time ASC`,
    [chatId],
  );
};

exports.deleteExpiredAssignments = async (chatId, now) => {
  return await dbRun(
    `DELETE FROM assignments WHERE chat_id = ? AND due_time <= ?`,
    [chatId, now],
  );
};

exports.createAssignment = async ({ chatId, title, dueTime, canvasId = 0 }) => {
  const result = await dbRun(
    `INSERT INTO assignments (chat_id, title, due_time, canvas_id)
     VALUES (?, ?, ?, ?)`,
    [chatId, title, dueTime, canvasId],
  );

  return {
    id: result.lastID,
    chatId,
    title,
    dueTime,
    canvasId,
  };
};

exports.deleteAssignment = async (id, chatId) => {
  // Get assignment first to return its info
  const assignment = await dbGet(
    `SELECT * FROM assignments WHERE id = ? AND chat_id = ?`,
    [id, chatId],
  );

  if (!assignment) {
    return { deleted: false };
  }

  await dbRun(`DELETE FROM assignments WHERE id = ? AND chat_id = ?`, [
    id,
    chatId,
  ]);

  return {
    deleted: true,
    assignment,
  };
};

exports.deleteAllAssignments = async (chatId) => {
  // Check count first
  const countResult = await dbGet(
    `SELECT COUNT(*) as count FROM assignments WHERE chat_id = ?`,
    [chatId],
  );

  if (countResult.count === 0) {
    return 0;
  }

  const result = await dbRun(`DELETE FROM assignments WHERE chat_id = ?`, [
    chatId,
  ]);

  return result.changes;
};

// ==================== CANVAS TOKENS ====================

exports.saveCanvasToken = async (chatId, token) => {
  const result = await dbRun(
    `INSERT OR REPLACE INTO canvas_tokens (chat_id, canvas_token)
     VALUES (?, ?)`,
    [chatId, token],
  );

  return { chatId, success: true };
};

exports.getCanvasToken = async (chatId) => {
  return await dbGet(
    `SELECT canvas_token FROM canvas_tokens WHERE chat_id = ?`,
    [chatId],
  );
};

exports.deleteCanvasToken = async (chatId) => {
  const result = await dbRun(`DELETE FROM canvas_tokens WHERE chat_id = ?`, [
    chatId,
  ]);

  return result.changes > 0;
};

exports.getAllCanvasTokens = async () => {
  return await dbAll(`SELECT * FROM canvas_tokens`);
};

exports.updateLastSync = async (chatId, timestamp) => {
  return await dbRun(
    `UPDATE canvas_tokens SET last_sync = ? WHERE chat_id = ?`,
    [timestamp, chatId],
  );
};

// ==================== REMINDER STATUS ====================

exports.updateReminderStatus = async (id, chatId, reminderType) => {
  const column = reminderType === "1d" ? "reminded_1d" : "reminded_5h";

  return await dbRun(
    `UPDATE assignments SET ${column} = 1 WHERE id = ? AND chat_id = ?`,
    [id, chatId],
  );
};

exports.getAllChatIds = async () => {
  const rows = await dbAll(`SELECT DISTINCT chat_id FROM assignments`);
  return rows.map((row) => row.chat_id);
};

exports.getAssignmentsForReminders = async (chatId) => {
  return await dbAll(
    `SELECT id, chat_id, title, due_time, reminded_1d, reminded_5h 
     FROM assignments 
     WHERE chat_id = ? AND due_time > ?
     ORDER BY due_time ASC`,
    [chatId, Date.now()],
  );
};

// Get all canvas tokens (for auto-sync scheduler)
exports.getAllCanvasTokensWithDetails = async () => {
  return await dbAll(
    `SELECT chat_id, canvas_token, last_sync FROM canvas_tokens`,
  );
};
