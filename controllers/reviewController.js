const Review = require('../models/Review');

exports.createReview = (req, res) => {
  Review.create(req.body, (err, reviewId) => {
    if (err) {
      return res.status(500).json({ error: 'Error al crear la reseña' });
    }
    res.status(201).json({ message: 'Reseña creada exitosamente', reviewId });
  });
};

exports.getVolunteerReviews = (req, res) => {
  Review.findByVolunteer(req.params.volunteerId, (err, reviews) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las reseñas' });
    }
    res.json(reviews);
  });
};