const db = require('../config/database');

  class Volunteer {
    static async getAll() {
      const [rows] = await db.execute('SELECT * FROM volunteers');
      return rows;
    }

    static async findById(id) {
      const [rows] = await db.execute('SELECT * FROM volunteers WHERE id = ?', [id]);
      return rows[0];
    }

    static async findByUserId(userId) {
      const [rows] = await db.execute('SELECT * FROM volunteers WHERE user_id = ?', [userId]);
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