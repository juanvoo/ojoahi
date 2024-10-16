const db = require('../config/database');

class Reservation {
  static create(reservationData, callback) {
    const query = 'INSERT INTO reservations (user_id, volunteer_id, reservation_date, reservation_time) VALUES (?, ?, ?, ?)';
    db.query(query, [reservationData.user_id, reservationData.volunteer_id, reservationData.reservation_date, reservationData.reservation_time], (error, results) => {
      if (error) return callback(error);
      callback(null, results.insertId);
    });
  }

  static findByUser(userId, callback) {
    const query = 'SELECT * FROM reservations WHERE user_id = ?';
    db.query(query, [userId], (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }

  static update(id, status, callback) {
    const query = 'UPDATE reservations SET status = ? WHERE id = ?';
    db.query(query, [status, id], (error, results) => {
      if (error) return callback(error);
      callback(null, results.affectedRows > 0);
    });
  }
}

module.exports = Reservation;