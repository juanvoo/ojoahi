// const db = require('../config/database');

// class Review {
//   static async create(userId, volunteerId, reservationId, rating, comment) {
//     const [result] = await db.execute(
//       'INSERT INTO reviews (user_id, volunteer_id, reservation_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
//       [userId, volunteerId, reservationId, rating, comment]
//     );
//     return result.insertId;
//   }

//   static async getByVolunteerId(volunteerId) {
//     const [rows] = await db.execute(
//       `SELECT r.*, u.username as user_name 
//        FROM reviews r 
//        JOIN users u ON r.user_id = u.id 
//        WHERE r.volunteer_id = ?
//        ORDER BY r.created_at DESC`,
//       [volunteerId]
//     );
//     return rows;
//   }

//   static async getAverageRating(volunteerId) {
//     const [result] = await db.execute(
//       'SELECT AVG(rating) as average_rating FROM reviews WHERE volunteer_id = ?',
//       [volunteerId]
//     );
//     return result[0].average_rating;
//   }
// }

// module.exports = Review;

const pool = require('../config/database');

class Review {
  static async create({ reservation_id, user_id, volunteer_id, rating, comment }) {
    try {
      let sql;
      let params;

      if (reservation_id) {
        sql = 'INSERT INTO reviews (reservation_id, user_id, volunteer_id, rating, comment) VALUES (?, ?, ?, ?, ?)';
        params = [reservation_id, user_id, volunteer_id, rating, comment];
      } else {
        sql = 'INSERT INTO reviews (user_id, volunteer_id, rating, comment) VALUES (?, ?, ?, ?)';
        params = [user_id, volunteer_id, rating, comment];
      }

      const [result] = await pool.execute(sql, params);
      return result.insertId;
    } catch (error) {
      console.error('Error al crear la reseña:', error);
      throw error;
    }
  }

  static async getReservationById(reservationId) {
    try {
      const [rows] = await pool.execute(
        'SELECT r.*, u.username as volunteer_name FROM reservations r JOIN users u ON r.volunteer_id = u.id WHERE r.id = ?',
        [reservationId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al obtener la reserva:', error);
      throw error;
    }
  }
}

module.exports = Review;