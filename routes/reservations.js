const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { isAuthenticated } = require('../middleware/auth');

// Crear una reserva
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { volunteerId, date, time, description } = req.body;
    const userId = req.session.user.id;
    await Reservation.create(userId, volunteerId, date, time, description);
    req.flash('success_msg', 'Reserva creada exitosamente');
    res.redirect('/blind-dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al crear la reserva');
    res.redirect('/blind-dashboard');
  }
});

// Cancelar una reserva
router.post('/cancel/:id', isAuthenticated, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    if (reservation.user_id !== req.session.user.id) {
      req.flash('error_msg', 'No tienes permiso para cancelar esta reserva');
      return res.redirect('/blind-dashboard');
    }
    await Reservation.updateStatus(reservationId, 'cancelled');
    req.flash('success_msg', 'Reserva cancelada exitosamente');
    res.redirect('/blind-dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cancelar la reserva');
    res.redirect('/blind-dashboard');
  }
});

// Aceptar una solicitud de reserva
router.post('/accept/:id', isAuthenticated, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    if (reservation.volunteer_id !== req.session.user.id) {
      req.flash('error_msg', 'No tienes permiso para aceptar esta reserva');
      return res.redirect('/volunteer-dashboard');
    }
    await Reservation.updateStatus(reservationId, 'confirmed');
    req.flash('success_msg', 'Reserva aceptada exitosamente');
    res.redirect('/volunteer-dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al aceptar la reserva');
    res.redirect('/volunteer-dashboard');
  }
});

// Rechazar una solicitud de reserva
router.post('/reject/:id', isAuthenticated, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    if (reservation.volunteer_id !== req.session.user.id) {
      req.flash('error_msg', 'No tienes permiso para rechazar esta reserva');
      return res.redirect('/volunteer-dashboard');
    }
    await Reservation.updateStatus(reservationId, 'rejected');
    req.flash('success_msg', 'Reserva rechazada exitosamente');
    res.redirect('/volunteer-dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al rechazar la reserva');
    res.redirect('/volunteer-dashboard');
  }
});

module.exports = router;