// const db = require('../config/database');
// const bcrypt = require('bcrypt');

// class User {
//   static create(userData, callback) {
//     bcrypt.hash(userData.password, 10, (err, hash) => {
//       if (err) return callback(err);
      
//       const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
//       db.query(query, [userData.username, userData.email, hash], (error, results) => {
//         if (error) return callback(error);
//         callback(null, results.insertId);
//       });
//     });
//   }

//   static findByEmail(email, callback) {
//     const query = 'SELECT * FROM users WHERE email = ?';
//     db.query(query, [email], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results[0]);
//     });
//   }

//   static getAll(callback) {
//     const query = 'SELECT id, username, email FROM users';
//     db.query(query, (error, results) => {
//       if (error) return callback(error);
//       callback(null, results);
//     });
//   }

//   static update(id, userData, callback) {
//     const query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
//     db.query(query, [userData.username, userData.email, id], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.affectedRows > 0);
//     });
//   }

//   static delete(id, callback) {
//     const query = 'DELETE FROM users WHERE id = ?';
//     db.query(query, [id], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.affectedRows > 0);
//     });
//   }
// }

// module.exports = User;

const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(username, email, password) {
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = User;