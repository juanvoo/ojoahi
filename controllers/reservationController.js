// const Reservation = require('../models/Reservation');

// exports.createReservation = (req, res) => {
//   Reservation.create(req.body, (err, reservationId) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al crear la reserva' });
//     }
//     res.status(201).json({ message: 'Reserva creada exitosamente', reservationId });
//   });
// };

// exports.getUserReservations = (req, res) => {
//   Reservation.findByUser(req.params.userId, (err, reservations) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al obtener las reservas' });
//     }
//     res.json(reservations);
//   });
// };

// exports.updateReservationStatus = (req, res) => {
//   Reservation.update(req.params.id, req.body.status, (err, success) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al actualizar la reserva' });
//     }
//     if (success) {
//       res.json({ message: 'Estado de la reserva actualizado exitosamente' });
//     } else {
//       res.status(404).json({ error: 'Reserva no encontrada' });
//     }
//   });
// };

const Reservation = require('../models/Reservation');
const Volunteer = require('../models/Volunteer');

exports.createReservationForm = async (req, res) => {
  try {
    const volunteers = await Volunteer.getAvailable();
    res.render('reservationForm', { volunteers });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al cargar el formulario de reserva');
    res.redirect('/');
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { volunteerId, date, time, description, isVideoCall } = req.body;
    const userId = req.session.user.id;
    await Reservation.create(userId, volunteerId, date, time, description, isVideoCall === 'on');
    req.flash('success_msg', 'Reserva creada exitosamente');
    res.redirect('/reservations');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al crear la reserva');
    res.redirect('/reservations/create');
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reservations = await Reservation.getByUserId(userId);
    res.render('userReservations', { reservations });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al obtener las reservas');
    res.redirect('/');
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await Reservation.update(id, 'cancelled');
    req.flash('success_msg', 'Reserva cancelada exitosamente');
    res.redirect('/reservations');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al cancelar la reserva');
    res.redirect('/reservations');
  }
};