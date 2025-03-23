const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const { isAuthenticated } = require('../middleware/auth');

// Rutas para crear solicitudes de ayuda
router.get('/create', isAuthenticated, helpRequestController.getCreateHelpRequest);
router.post('/create', isAuthenticated, helpRequestController.postCreateHelpRequest);

// Rutas para aceptar/rechazar solicitudes
router.get('/accept/:id', isAuthenticated, helpRequestController.acceptHelpRequest);
router.get('/reject/:id', isAuthenticated, helpRequestController.rejectHelpRequest);

// Ruta para ver todas las solicitudes pendientes (para voluntarios)
router.get('/pending', isAuthenticated, helpRequestController.getPendingHelpRequests);

module.exports = router;