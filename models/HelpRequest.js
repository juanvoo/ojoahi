const db = require('../config/database');

class HelpRequest {
  static async create(requestData) {
    const { user_id, volunteer_id, description, date, time, status } = requestData;
    const [result] = await db.execute(
      'INSERT INTO help_requests (user_id, volunteer_id, description, date, time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, volunteer_id, description, date, time, status]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM help_requests WHERE user_id = ?', [userId]);
    return rows;
  }

  static async findByVolunteerId(volunteerId) {
    const [rows] = await db.execute('SELECT * FROM help_requests WHERE volunteer_id = ?', [volunteerId]);
    return rows;
  }

  static async updateStatus(requestId, status) {
    await db.execute('UPDATE help_requests SET status = ? WHERE id = ?', [status, requestId]);
  }
}

module.exports = HelpRequest;