// controllers/dashboardController.js
const Volunteer = require('../models/Volunteer');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');

exports.volunteerDashboard = async (req, res) => {
  try {
    // Obtener el ID del voluntario a partir del ID de usuario
    const volunteer = await Volunteer.findByUserId(req.session.user.id);
    
    if (!volunteer) {
      req.flash('error_msg', 'No se encontró el perfil de voluntario');
      return res.redirect('/');
    }
    
    // Obtener las reservas para este voluntario específico
    const reservations = await Reservation.getByVolunteerId(volunteer.id);
    
    // Obtener las reseñas para este voluntario
    const reviews = await Review.getByVolunteerId(volunteer.id);
    
    res.render('dashboard/volunteer', {
      title: 'Dashboard de Voluntario',
      user: req.session.user,
      volunteer,
      reservations,
      reviews
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cargar el dashboard');
    res.redirect('/');
  }
};