const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.update(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session.user.id;
    console.log(`Intentando eliminar usuario con ID: ${userId}`);
    
    const deleted = await User.deleteById(userId);

    if (deleted) {
      console.log(`Usuario con ID ${userId} eliminado exitosamente`);
      req.session.destroy((err) => {
        if (err) {
          console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/');
      });
    } else {
      console.log(`No se pudo eliminar el usuario con ID ${userId}`);
      req.flash('error_msg', 'No se pudo eliminar la cuenta');
      res.redirect(req.get('Referrer') || '/');
    }
  } catch (error) {
    console.error('Error detallado al eliminar la cuenta:', error);
    req.flash('error_msg', 'Error al eliminar la cuenta. Por favor, inténtelo de nuevo más tarde.');
    res.redirect(req.get('Referrer') || '/');
  }
};

exports.getBlindDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reservations = await User.getReservationsForUser(userId);
    const completedReservations = await User.getCompletedReservationsForUser(userId);
    const reviews = await User.getReviewsForUser(userId);
    const volunteerReviews = await User.getVolunteerReviews();

    res.render('dashboard/blind', {
      user: req.session.user,
      reservations,
      completedReservations,
      reviews,
      volunteerReviews
    });
  } catch (error) {
    console.error('Error al obtener el dashboard del usuario ciego:', error);
    req.flash('error_msg', 'Hubo un error al cargar tu dashboard');
    res.redirect('/');
  }
};

exports.getVolunteerDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reservations = await User.getReservationsForVolunteer(userId);
    const reviews = await User.getReviewsForVolunteer(userId);
    const pendingRequests = await User.getPendingHelpRequests();
    const volunteerReviews = await User.getVolunteerReviews();

    res.render('volunteer-dashboard', {
      user: req.session.user,
      reservations,
      reviews,
      pendingRequests,
      volunteerReviews
    });
  } catch (error) {
    console.error('Error al obtener el dashboard del voluntario:', error);
    req.flash('error_msg', 'Hubo un error al cargar tu dashboard');
    res.redirect('/');
  }
};