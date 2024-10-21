const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/create', isAuthenticated, reservationController.createReservationForm);
router.post('/create', isAuthenticated, reservationController.createReservation);
router.get('/', isAuthenticated, reservationController.getUserReservations);
router.post('/cancel/:id', isAuthenticated, reservationController.cancelReservation);

module.exports = router;