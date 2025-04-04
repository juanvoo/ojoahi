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
    
    // Validar que el volunteerId sea válido
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      req.flash('error_msg', 'Voluntario no encontrado');
      return res.redirect('/reservations/create');
    }
    
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