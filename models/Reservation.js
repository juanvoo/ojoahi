// const db = require('../config/database');

// class Reservation {
//   static create(reservationData, callback) {
//     const query = 'INSERT INTO reservations (user_id, volunteer_id, reservation_date, reservation_time) VALUES (?, ?, ?, ?)';
//     db.query(query, [reservationData.user_id, reservationData.volunteer_id, reservationData.reservation_date, reservationData.reservation_time], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.insertId);
//     });
//   }

//   static findByUser(userId, callback) {
//     const query = 'SELECT * FROM reservations WHERE user_id = ?';
//     db.query(query, [userId], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results);
//     });
//   }

//   static update(id, status, callback) {
//     const query = 'UPDATE reservations SET status = ? WHERE id = ?';
//     db.query(query, [status, id], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.affectedRows > 0);
//     });
//   }
// }

// module.exports = Reservation;

const db = require('../config/database');

class Reservation {
  static async create(userId, volunteerId, date, time, description, isVideoCall) {
    const [result] = await db.execute(
      'INSERT INTO reservations (user_id, volunteer_id, date, time, description, is_video_call, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, volunteerId, date, time, description, isVideoCall, 'pending']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT r.*, v.name as volunteer_name 
       FROM reservations r 
       JOIN volunteers v ON r.volunteer_id = v.id 
       WHERE r.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, status) {
    await db.execute(
      'UPDATE reservations SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async delete(id) {
    await db.execute('DELETE FROM reservations WHERE id = ?', [id]);
  }

  static async getByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT r.*, v.name as volunteer_name 
       FROM reservations r 
       JOIN volunteers v ON r.volunteer_id = v.id 
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
}

module.exports = Reservation;