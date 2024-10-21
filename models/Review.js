// const db = require('../config/database');

// class Review {
//   static create(reviewData, callback) {
//     const query = 'INSERT INTO reviews (user_id, volunteer_id, rating, comment) VALUES (?, ?, ?, ?)';
//     db.query(query, [reviewData.user_id, reviewData.volunteer_id, reviewData.rating, reviewData.comment], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results.insertId);
//     });
//   }

//   static findByVolunteer(volunteerId, callback) {
//     const query = 'SELECT * FROM reviews WHERE volunteer_id = ?';
//     db.query(query, [volunteerId], (error, results) => {
//       if (error) return callback(error);
//       callback(null, results);
//     });
//   }
// }

// module.exports = Review;

const db = require('../config/database');

class Review {
  static async create(userId, volunteerId, reservationId, rating, comment) {
    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, volunteer_id, reservation_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, volunteerId, reservationId, rating, comment]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByVolunteerId(volunteerId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.volunteer_id = ?
       ORDER BY r.created_at DESC`,
      [volunteerId]
    );
    return rows;
  }

  static async getAverageRatingByVolunteerId(volunteerId) {
    const [rows] = await db.execute(
      'SELECT AVG(rating) as average_rating FROM reviews WHERE volunteer_id = ?',
      [volunteerId]
    );
    return rows[0].average_rating;
  }
}

module.exports = Review;