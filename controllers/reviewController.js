// const Review = require('../models/Review');

// exports.createReview = (req, res) => {
//   Review.create(req.body, (err, reviewId) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al crear la reseña' });
//     }
//     res.status(201).json({ message: 'Reseña creada exitosamente', reviewId });
//   });
// };

// exports.getVolunteerReviews = (req, res) => {
//   Review.findByVolunteer(req.params.volunteerId, (err, reviews) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al obtener las reseñas' });
//     }
//     res.json(reviews);
//   });
// };

// const Review = require('../models/Review');
// const Reservation = require('../models/Reservation');

// exports.createReviewForm = async (req, res) => {
//   try {
//     const { reservationId } = req.params;
//     const reservation = await Reservation.findById(reservationId);
//     if (!reservation || reservation.user_id !== req.session.user.id) {
//       req.flash('error_msg', 'No tienes permiso para dejar una reseña para esta reserva');
//       return res.redirect('/reservations');
//     }
//     res.render('reviewForm', { reservationId });
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Ocurrió un error al cargar el formulario de reseña');
//     res.redirect('/reservations');
//   }
// };

// exports.createReview = async  (req, res) => {
//   try {
//     const { reservationId, rating, comment } = req.body;
//     const userId = req.session.user.id;
//     const reservation = await Reservation.findById(reservationId);
//     if (!reservation || reservation.user_id !== userId) {
//       req.flash('error_msg', 'No tienes permiso para dejar una reseña para esta reserva');
//       return res.redirect('/reservations');
//     }
//     await Review.create(userId, reservation.volunteer_id, reservationId, rating, comment);
//     req.flash('success_msg', 'Reseña enviada exitosamente');
//     res.redirect('/reservations');
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Ocurrió un error al crear la reseña');
//     res.redirect('/reservations');
//   }
// };

// exports.getVolunteerReviews = async (req, res) => {
//   try {
//     const { volunteerId } = req.params;
//     const reviews = await Review.getByVolunteerId(volunteerId);
//     const averageRating = await Review.getAverageRatingByVolunteerId(volunteerId);
//     res.render('volunteerReviews', { reviews, averageRating });
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Ocurrió un error al obtener las reseñas');
//     res.redirect('/');
//   }
// };

const Review = require('../models/Review');
const User = require('../models/User');

exports.getCreateReview = async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    let reservation = null;
    let volunteers = [];

    if (reservationId) {
      reservation = await Review.getReservationById(reservationId);
      if (!reservation) {
        req.flash('error_msg', 'Reserva no encontrada');
        return res.redirect('/users/dashboard');
      }
    } else {
      volunteers = await User.getVolunteers();
    }

    res.render('reviews/create', {
      reservationId,
      volunteerName: reservation ? reservation.volunteer_name : null,
      volunteers
    });
  } catch (error) {
    console.error('Error al cargar el formulario de reseña:', error);
    req.flash('error_msg', 'Hubo un error al cargar el formulario de reseña');
    res.redirect('/users/dashboard');
  }
};

exports.postCreateReview = async (req, res) => {
  try {
    const { rating, comment, volunteerId } = req.body;
    const reservationId = req.params.reservationId;
    const userId = req.session.user.id;

    let volunteerIdToUse = volunteerId;

    if (reservationId) {
      const reservation = await Review.getReservationById(reservationId);
      if (!reservation) {
        req.flash('error_msg', 'Reserva no encontrada');
        return res.redirect('/users/dashboard');
      }
      volunteerIdToUse = reservation.volunteer_id;
    }

    await Review.create({
      reservation_id: reservationId || null,
      user_id: userId,
      volunteer_id: volunteerIdToUse,
      rating,
      comment
    });

    req.flash('success_msg', 'Reseña creada exitosamente');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al crear la reseña:', error);
    req.flash('error_msg', 'Hubo un error al crear la reseña: ' + error.message);
    res.redirect('/users/dashboard');
  }
};