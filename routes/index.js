const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const volunteerController = require('../controllers/volunteerController');
const reservationController = require('../controllers/reservationController');
const reviewController = require('../controllers/reviewController');

// Rutas de usuario existentes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Nuevas rutas para voluntarios
router.get('/volunteers', volunteerController.getAllVolunteers);
router.get('/volunteers/:id', volunteerController.getVolunteerById);
router.post('/volunteers', volunteerController.createVolunteer);
router.put('/volunteers/:id', volunteerController.updateVolunteer);

// Nuevas rutas para reservas
router.post('/reservations', reservationController.createReservation);
router.get('/reservations/user/:userId', reservationController.getUserReservations);
router.put('/reservations/:id', reservationController.updateReservationStatus);

// Nuevas rutas para reseñas
router.post('/reviews', reviewController.createReview);
router.get('/reviews/volunteer/:volunteerId', reviewController.getVolunteerReviews);

module.exports = router;