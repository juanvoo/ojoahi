const User = require('../models/User');
const Review = require('../models/Review');
const HelpRequest = require('../models/HelpRequest');

exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await User.getAllVolunteers();
    res.render('volunteerList', { 
      title: 'Lista de Voluntarios', 
      volunteers,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener la lista de voluntarios');
    res.redirect('/blind-dashboard');
  }
};

exports.getVolunteerDashboard = async (req, res) => {
  try {
    const volunteerId = req.session.user.id;
    if (!volunteerId) {
      throw new Error('Usuario no autenticado');
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      throw new Error('Voluntario no encontrado');
    }

    const reviews = await Review.getReviewsForVolunteer(volunteerId);
    const helpRequests = await HelpRequest.getRequestsForVolunteer(volunteerId);

    res.render('volunteer-dashboard', {
      title: 'Dashboard del Voluntario',
      volunteer,
      reviews,
      helpRequests
    });
  } catch (error) {
    console.error('Error en el dashboard del voluntario:', error);
    req.flash('error_msg', 'Hubo un error al cargar tu dashboard. Por favor, intenta de nuevo más tarde.');
    res.redirect('/');
  }
};

exports.acceptHelpRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    await HelpRequest.updateStatus(requestId, 'accepted');
    req.flash('success_msg', 'Solicitud de ayuda aceptada con éxito');
    res.redirect('/volunteer/dashboard');
  } catch (error) {
    console.error('Error al aceptar la solicitud de ayuda:', error);
    req.flash('error_msg', 'Hubo un error al aceptar la solicitud. Por favor, intenta de nuevo.');
    res.redirect('/volunteer/dashboard');
  }
};

exports.rejectHelpRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    await HelpRequest.updateStatus(requestId, 'rejected');
    req.flash('success_msg', 'Solicitud de ayuda rechazada');
    res.redirect('/volunteer/dashboard');
  } catch (error) {
    console.error('Error al rechazar la solicitud de ayuda:', error);
    req.flash('error_msg', 'Hubo un error al rechazar la solicitud. Por favor, intenta de nuevo.');
    res.redirect('/volunteer/dashboard');
  }
};