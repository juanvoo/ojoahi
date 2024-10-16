const db = require('../config/database');

class Volunteer {
  static create(volunteerData, callback) {
    const query = 'INSERT INTO volunteers (user_id, full_name, contact_info, availability) VALUES (?, ?, ?, ?)';
    db.query(query, [volunteerData.user_id, volunteerData.full_name, volunteerData.contact_info, volunteerData.availability], (error, results) => {
      if (error) return callback(error);
      callback(null, results.insertId);
    });
  }

  static findAll(callback) {
    const query = 'SELECT * FROM volunteers';
    db.query(query, (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }

  static findById(id, callback) {
    const query = 'SELECT * FROM volunteers WHERE id = ?';
    db.query(query, [id], (error, results) => {
      if (error) return callback(error);
      callback(null, results[0]);
    });
  }

  static update(id, volunteerData, callback) {
    const query = 'UPDATE volunteers SET full_name = ?, contact_info = ?, availability = ? WHERE id = ?';
    db.query(query, [volunteerData.full_name, volunteerData.contact_info, volunteerData.availability, id], (error, results) => {
      if (error) return callback(error);
      callback(null, results.affectedRows > 0);
    });
  }
}

module.exports = Volunteer;