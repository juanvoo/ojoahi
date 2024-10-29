// const Volunteer = require('../models/Volunteer');

// exports.getAllVolunteers = (req, res) => {
//   Volunteer.findAll((err, volunteers) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al obtener los voluntarios' });
//     }
//     res.json(volunteers);
//   });
// };

// exports.getVolunteerById = (req, res) => {
//   Volunteer.findById(req.params.id, (err, volunteer) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al obtener el voluntario' });
//     }
//     if (!volunteer) {
//       return res.status(404).json({ error: 'Voluntario no encontrado' });
//     }
//     res.json(volunteer);
//   });
// };

// exports.createVolunteer = (req, res) => {
//   Volunteer.create(req.body, (err, volunteerId) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al crear el voluntario' });
//     }
//     res.status(201).json({ message: 'Voluntario creado exitosamente', volunteerId });
//   });
// };

// exports.updateVolunteer = (req, res) => {
//   Volunteer.update(req.params.id, req.body, (err, success) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al actualizar el voluntario' });
//     }
//     if (success) {
//       res.json({ message: 'Voluntario actualizado exitosamente' });
//     } else {
//       res.status(404).json({ error: 'Voluntario no encontrado' });
//     }
//   });
// };

const User = require('../models/User');

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