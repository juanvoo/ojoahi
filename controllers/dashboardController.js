// controllers/dashboardController.js
const Volunteer = require('../models/Volunteer');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

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

exports.blindDashboard = async (req, res) => {
  try {
    const user = req.session.user;

    // Obtener reservas del usuario
    const reservations = await Reservation.find({
      user_id: user.id,
      // Ordenar por fecha, las más recientes primero
      sort: { date: -1 }
    });

    // Obtener reseñas hechas por el usuario
    const reviews = await Review.find({
      user_id: user.id,
      // Ordenar por fecha de creación, las más recientes primero
      sort: { created_at: -1 }
    });

    // Obtener notificaciones no leídas
    const notifications = await Notification.find({
      user_id: user.id,
      unread: true,
      // Ordenar por fecha, las más recientes primero
      sort: { created_at: -1 }
    });

    // Obtener cantidad de mensajes no leídos
    const unreadMessages = await Message.countUnread(user.id);

    // Formatear las reservas para la vista
    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      date: reservation.date,
      time: reservation.time,
      volunteer_name: reservation.volunteer_name,
      volunteer_id: reservation.volunteer_id,
      description: reservation.description,
      status: reservation.status
    }));

    // Formatear las reseñas para la vista
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      volunteer_name: review.volunteer_name,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at
    }));

    // Formatear las notificaciones para la vista
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type, // 'assistance', 'message', 'review', etc.
      created_at: notification.created_at,
      unread: notification.unread
    }));

    // Renderizar la vista con todos los datos
    res.render('dashboard/blind', {
      title: 'Dashboard',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      reservations: formattedReservations,
      reviews: formattedReviews,
      notifications: formattedNotifications,
      unreadMessages,
      // Helpers para la vista
      helpers: {
        formatDate: function(date) {
          return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error en blind dashboard:', error);
    req.flash('error', 'Hubo un error al cargar el dashboard');
    res.redirect('/');
  }
};

// Marcar una notificación como leída
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.session.user.id;

    await Notification.markAsRead(notificationId, userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al marcar la notificación como leída' 
    });
  }
};

// Marcar todas las notificaciones como leídas
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.session.user.id;

    await Notification.markAllAsRead(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al marcar las notificaciones como leídas' 
    });
  }
};

// Cancelar una reserva
exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.session.user.id;

    // Verificar que la reserva pertenezca al usuario
    const reservation = await Reservation.findOne({
      id: reservationId,
      user_id: userId
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    // Verificar que la reserva esté en estado pendiente
    if (reservation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden cancelar reservas pendientes'
      });
    }

    // Cancelar la reserva
    await Reservation.cancel(reservationId);

    // Crear notificación para el voluntario
    await Notification.create({
      user_id: reservation.volunteer_id,
      title: 'Reserva cancelada',
      message: `${req.session.user.username} ha cancelado la reserva del ${new Date(reservation.date).toLocaleDateString()}`,
      type: 'assistance'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar la reserva'
    });
  }
};

// Obtener estado del chat
exports.getChatStatus = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const unreadCount = await Message.countUnread(userId);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error al obtener estado del chat:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado del chat'
    });
  }
};