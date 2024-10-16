const db = require('../config/database');

class Review {
  static create(reviewData, callback) {
    const query = 'INSERT INTO reviews (user_id, volunteer_id, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(query, [reviewData.user_id, reviewData.volunteer_id, reviewData.rating, reviewData.comment], (error, results) => {
      if (error) return callback(error);
      callback(null, results.insertId);
    });
  }

  static findByVolunteer(volunteerId, callback) {
    const query = 'SELECT * FROM reviews WHERE volunteer_id = ?';
    db.query(query, [volunteerId], (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }
}

module.exports = Review;