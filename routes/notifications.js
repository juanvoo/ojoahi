const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');

// Marcar todas las notificaciones como leídas
router.get('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    await Notification.markAllAsRead(userId);
    
    req.flash('success_msg', 'Todas las notificaciones han sido marcadas como leídas');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al marcar las notificaciones como leídas:', error);
    req.flash('error_msg', 'Error al marcar las notificaciones como leídas');
    res.redirect('/users/dashboard');
  }
});

// Marcar una notificación específica como leída
router.get('/mark-read/:id', isAuthenticated, async (req, res) => {
  try {
    const notificationId = req.params.id;
    await Notification.markAsRead(notificationId);
    
    req.flash('success_msg', 'Notificación marcada como leída');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error al marcar la notificación como leída:', error);
    req.flash('error_msg', 'Error al marcar la notificación como leída');
    res.redirect('/users/dashboard');
  }
});

module.exports = router;