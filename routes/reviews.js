const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');

// Rutas para crear reseñas
router.get('/create', isAuthenticated, reviewController.getCreateReview);
router.get('/create/:reservationId', isAuthenticated, reviewController.getCreateReview);
router.post('/create', isAuthenticated, reviewController.postCreateReview);
router.post('/create/:reservationId', isAuthenticated, reviewController.postCreateReview);

// Ruta para ver las reseñas de un voluntario
router.get('/volunteer/:volunteerId', reviewController.getVolunteerReviews);

module.exports = router;