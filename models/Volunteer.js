// const db = require('../config/database');

// class Volunteer {
//   static create(volunteerData, callback) {
//     const query = 'INSERT INTO volunteers (user_id, full_name, contact_info, availability) VALUES (?, ?, ?, ?)';
//     db.query(query, [volunteerData.user_id, volunteerData.full_name, volunteerData.contact_info, volunteerData.availability], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.insertId);
//     });
//   }

//   static findAll(callback) {
//     const query = 'SELECT * FROM volunteers';
//     db.query(query, (error, results) => {
//       if (error) return callback(error);
//       callback(null, results);
//     });
//   }

//   static findById(id, callback) {
//     const query = 'SELECT * FROM volunteers WHERE id = ?';
//     db.query(query, [id], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results[0]);
//     });
//   }

//   static update(id, volunteerData, callback) {
//     const query = 'UPDATE volunteers SET full_name = ?, contact_info = ?, availability = ? WHERE id = ?';
//     db.query(query, [volunteerData.full_name, volunteerData.contact_info, volunteerData.availability, id], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.affectedRows > 0);
//     });
//   }
// }

// module.exports = Volunteer;

const db = require('../config/database');

class Volunteer {
  static async create(name, email, phone, availability) {
    const [result] = await db.execute(
      'INSERT INTO volunteers (name, email, phone, availability) VALUES (?, ?, ?, ?)',
      [name, email, phone, availability]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM volunteers WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, name, email, phone, availability) {
    await db.execute(
      'UPDATE volunteers SET name = ?, email = ?, phone = ?, availability = ? WHERE id = ?',
      [name, email, phone, availability, id]
    );
  }

  static async delete(id) {
    await db.execute('DELETE FROM volunteers WHERE id = ?', [id]);
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM volunteers');
    return rows;
  }

  static async getAvailable() {
    const [rows] = await db.execute('SELECT * FROM volunteers WHERE availability = true');
    return rows;
  }
}

module.exports = Volunteer;