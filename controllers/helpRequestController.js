const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const pool = require('../config/database');

exports.showRequestForm = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    const volunteer = await User.findById(volunteerId);
    
    if (!volunteer || volunteer.user_type !== 'volunteer') {
      req.flash('error_msg', 'Voluntario no encontrado');
      return res.redirect('/volunteerList');
    }

    res.render('request-help', { 
      title: 'Solicitar Ayuda', 
      volunteer,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al cargar el formulario de solicitud');
    res.redirect('/volunteerList');
  }
};

exports.submitRequest = async (req, res) => {
  try {
    const { volunteerId, description, date, time } = req.body;
    const userId = req.session.user.id;

    await HelpRequest.create({
      user_id: userId,
      volunteer_id: volunteerId,
      description,
      date,
      time,
      status: 'pending'
    });

    req.flash('success_msg', 'Solicitud de ayuda enviada con éxito');
    res.redirect('/blind-dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al enviar la solicitud de ayuda');
    res.redirect('/volunteerList');
  }
};

exports.acceptHelpRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const volunteerId = req.session.user.id;

    await pool.execute(
      'UPDATE help_requests SET status = "accepted", volunteer_id = ? WHERE id = ?',
      [volunteerId, requestId]
    );

    req.flash('success_msg', 'Has aceptado la solicitud de ayuda');
    res.redirect('/users/volunteer-dashboard');
  } catch (error) {
    console.error('Error al aceptar la solicitud de ayuda:', error);
    req.flash('error_msg', 'Hubo un error al aceptar la solicitud');
    res.redirect('/users/volunteer-dashboard');
  }
};

exports.rejectHelpRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    await pool.execute(
      'UPDATE help_requests SET status = "rejected" WHERE id = ?',
      [requestId]
    );

    req.flash('success_msg', 'Has rechazado la solicitud de ayuda');
    res.redirect('/users/volunteer-dashboard');
  } catch (error) {
    console.error('Error al rechazar la solicitud de ayuda:', error);
    req.flash('error_msg', 'Hubo un error al rechazar la solicitud');
    res.redirect('/users/volunteer-dashboard');
  }
};