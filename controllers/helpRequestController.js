const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');

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