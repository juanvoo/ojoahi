const db = require('../config/database');

class Volunteer {
  static async getAll() {
    const [rows] = await db.execute(
      `SELECT v.*, u.username as name 
       FROM volunteers v 
       JOIN users u ON v.user_id = u.id`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT v.*, u.username as name 
       FROM volunteers v 
       JOIN users u ON v.user_id = u.id 
       WHERE v.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(userId, bio, skills, availability) {
    const [result] = await db.execute(
      'INSERT INTO volunteers (user_id, bio, skills, availability) VALUES (?, ?, ?, ?)',
      [userId, bio, skills, availability]
    );
    return result.insertId;
  }

  static async update(id, bio, skills, availability) {
    await db.execute(
      'UPDATE volunteers SET bio = ?, skills = ?, availability = ? WHERE id = ?',
      [bio, skills, availability, id]
    );
  }
}

module.exports = Volunteer;