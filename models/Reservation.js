const db = require('../config/database');

class Reservation {
  static async create(userId, volunteerId, date, time, description) {
    const [result] = await db.execute(
      'INSERT INTO reservations (user_id, volunteer_id, date, time, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, volunteerId, date, time, description, 'pending']
    );
    return result.insertId;
  }

  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username as volunteer_name 
       FROM reservations r 
       JOIN users u ON r.volunteer_id = u.id 
       WHERE r.user_id = ?
       ORDER BY r.date DESC, r.time DESC`,
      [userId]
    );
    return rows;
  }

  static async getByVolunteerId(volunteerId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username as user_name 
       FROM reservations r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.volunteer_id = ?
       ORDER BY r.date DESC, r.time DESC`,
      [volunteerId]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await db.execute(
      'UPDATE reservations SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM reservations WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Reservation;