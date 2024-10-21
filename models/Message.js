const db = require('../config/database');

class Message {
  static async create(senderId, receiverId, content) {
    const [result] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content]
    );
    return result.insertId;
  }

  static async getConversation(user1Id, user2Id) {
    const [rows] = await db.execute(
      `SELECT m.*, u.username as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [user1Id, user2Id, user2Id, user1Id]
    );
    return rows;
  }
}

module.exports = Message;