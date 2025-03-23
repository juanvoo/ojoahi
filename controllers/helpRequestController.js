const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

exports.getCreateHelpRequest = async (req, res) => {
  try {
    // Obtener la lista de voluntarios disponibles
    const volunteers = await User.getVolunteers();
    
    res.render('helpRequests/create', {
      title: 'Solicitar Ayuda',
      volunteers
    });
  } catch (error) {
    console.error('Error al cargar la página de solicitud de ayuda:', error);
    req.flash('error_msg', 'Error al cargar la página');
    res.redirect('/users/dashboard');
  }
};

exports.postCreateHelpRequest = async (req, res) => {
  try {
    const { volunteer_id, description, date, time } = req.body;
    const user_id = req.session.user.id;
    
    // Validación básica
    if (!description || !date || !time) {
      req.flash('error_msg', 'Por favor, completa todos los campos requeridos');
      return res.redirect('/help-requests/create');
    }
    
    // Crear la solicitud de ayuda
    await HelpRequest.create({
      user_id,
      volunteer_id: volunteer_id || null,
      description,
      date,
      time
    });
    
    req.flash('success_msg', 'Solicitud de ayuda creada exitosamente');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al crear la solicitud de ayuda:', error);
    req.flash('error_msg', 'Error al crear la solicitud de ayuda');
    res.redirect('/help-requests/create');
  }
};

exports.acceptHelpRequest = async (req, res) => {
  try {
    const helpRequestId = req.params.id;
    const volunteerId = req.session.user.id;
    
    // Obtener la solicitud de ayuda
    const helpRequest = await HelpRequest.getById(helpRequestId);
    if (!helpRequest) {
      req.flash('error_msg', 'Solicitud de ayuda no encontrada');
      return res.redirect('/users/dashboard');
    }
    
    // Actualizar el estado de la solicitud
    await HelpRequest.updateStatus(helpRequestId, 'accepted', volunteerId);
    
    // Crear notificación para el usuario ciego
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: helpRequest.user_id,
      title: 'Solicitud de ayuda aceptada',
      message: `Tu solicitud de ayuda para el ${new Date(helpRequest.date).toLocaleDateString()} a las ${helpRequest.time} ha sido aceptada por ${req.session.user.username}.`,
      type: 'help_request_accepted'
    });
    
    req.flash('success_msg', 'Solicitud de ayuda aceptada exitosamente');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al aceptar la solicitud de ayuda:', error);
    req.flash('error_msg', 'Error al aceptar la solicitud de ayuda');
    res.redirect('/users/dashboard');
  }
};

exports.rejectHelpRequest = async (req, res) => {
  try {
    const helpRequestId = req.params.id;
    
    // Obtener la solicitud de ayuda
    const helpRequest = await HelpRequest.getById(helpRequestId);
    if (!helpRequest) {
      req.flash('error_msg', 'Solicitud de ayuda no encontrada');
      return res.redirect('/users/dashboard');
    }
    
    // Actualizar el estado de la solicitud
    await HelpRequest.updateStatus(helpRequestId, 'rejected');
    
    // Crear notificación para el usuario ciego
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: helpRequest.user_id,
      title: 'Solicitud de ayuda rechazada',
      message: `Tu solicitud de ayuda para el ${new Date(helpRequest.date).toLocaleDateString()} a las ${helpRequest.time} ha sido rechazada.`,
      type: 'help_request_rejected'
    });
    
    req.flash('success_msg', 'Solicitud de ayuda rechazada');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al rechazar la solicitud de ayuda:', error);
    req.flash('error_msg', 'Error al rechazar la solicitud de ayuda');
    res.redirect('/users/dashboard');
  }
};

exports.getPendingHelpRequests = async (req, res) => {
  try {
    const pendingRequests = await HelpRequest.getAllPending();
    
    res.render('helpRequests/pending', {
      title: 'Solicitudes de Ayuda Pendientes',
      pendingRequests
    });
  } catch (error) {
    console.error('Error al cargar las solicitudes pendientes:', error);
    req.flash('error_msg', 'Error al cargar las solicitudes pendientes');
    res.redirect('/users/dashboard');
  }
};