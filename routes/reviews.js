// const express = require('express');
// const router = express.Router();
// const Review = require('../models/Review');
// const Reservation = require('../models/Reservation');
// const { isAuthenticated } = require('../middleware/auth');

// // Crear una reseña
// router.post('/create/:reservationId', isAuthenticated, async (req, res) => {
//   try {
//     const { rating, comment } = req.body;
//     const reservationId = req.params.reservationId;
//     const userId = req.session.user.id;

//     const reservation = await Reservation.findById(reservationId);
//     if (!reservation || reservation.user_id !== userId) {
//       req.flash('error_msg', 'No tienes permiso para dejar una reseña para esta reserva');
//       return res.redirect('/blind-dashboard');
//     }

//     await Review.create(userId, reservation.volunteer_id, reservationId, rating, comment);
//     req.flash('success_msg', 'Reseña creada exitosamente');
//     res.redirect('/blind-dashboard');
//   } catch (error) {
//     console.error(error);
//     req.flash('error_msg', 'Error al crear la reseña');
//     res.redirect('/blind-dashboard');
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/create', isAuthenticated, reviewController.getCreateReview);
router.post('/create', isAuthenticated, reviewController.postCreateReview);
router.get('/create/:reservationId', isAuthenticated, reviewController.getCreateReview);
router.post('/create/:reservationId', isAuthenticated, reviewController.postCreateReview);

module.exports = router;