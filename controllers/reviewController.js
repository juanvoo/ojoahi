const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getCreateReview = async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    let volunteer = null;
    
    const ratingLabels = [
      { value: 5, label: 'Excelente' },
      { value: 4, label: 'Muy bueno' },
      { value: 3, label: 'Bueno' },
      { value: 2, label: 'Regular' },
      { value: 1, label: 'Necesita mejorar' }
    ];

    if (reservationId) {
      const reservation = await Review.getReservationById(reservationId);
      if (!reservation) {
        req.flash('error_msg', 'Reserva no encontrada');
        return res.redirect('/users/dashboard');
      }
      volunteer = await User.findById(reservation.volunteer_id);
    } else {
      const volunteers = await User.getVolunteers();
      return res.render('reviews/create', {
        title: 'Dejar Reseña',
        volunteers,
        ratingLabels
      });
    }
    
    res.render('reviews/create', {
      title: 'Dejar Reseña',
      reservationId,
      volunteer,
      ratingLabels
    });
  } catch (error) {
    console.error('Error al cargar el formulario de reseña:', error);
    req.flash('error_msg', 'Error al cargar el formulario');
    res.redirect('/users/dashboard');
  }
};

exports.postCreateReview = async (req, res) => {
  try {
    const reservationId = req.params.reservationId || null;
    const { volunteer_id, rating, comment } = req.body;
    const user_id = req.session.user.id;
    
    // Validación básica
    if (!volunteer_id || !rating || !comment) {
      req.flash('error_msg', 'Por favor, completa todos los campos requeridos');
      return res.redirect(reservationId ? `/reviews/create/${reservationId}` : '/reviews/create');
    }
    
    // Crear la reseña - pasando los parámetros individualmente
    await Review.create(user_id, volunteer_id, reservationId, rating, comment);
    
    // Crear notificación para el voluntario
    await Notification.create({
      user_id: volunteer_id,
      title: 'Nueva reseña recibida',
      message: `Has recibido una nueva reseña con calificación de ${rating} estrellas.`,
      type: 'new_review'
    });
    
    req.flash('success_msg', 'Reseña enviada exitosamente');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al crear la reseña:', error);
    req.flash('error_msg', 'Error al crear la reseña');
    res.redirect('/users/dashboard');
  }
};

exports.getVolunteerReviews = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    
    // Obtener el voluntario
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      req.flash('error_msg', 'Voluntario no encontrado');
      return res.redirect('/users/dashboard');
    }
    
    // Obtener las reseñas del voluntario
    const reviews = await Review.getByVolunteerId(volunteerId);
    
    // Obtener la calificación promedio
    const { averageRating, totalReviews } = await Review.getAverageRatingByVolunteerId(volunteerId);
    
    res.render('reviews/volunteer', {
      title: `Reseñas de ${volunteer.username}`,
      volunteer,
      reviews,
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error al cargar las reseñas del voluntario:', error);
    req.flash('error_msg', 'Error al cargar las reseñas');
    res.redirect('/users/dashboard');
  }
};