const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Lista de conversaciones
router.get('/', isAuthenticated, chatController.getConversations);

// Ver conversación específica
router.get('/:id', isAuthenticated, chatController.getConversation);

// Enviar mensaje
router.post('/send', isAuthenticated, chatController.sendMessage);

// Iniciar conversación con un usuario
router.get('/start/:id', isAuthenticated, chatController.startConversation);

// Ruta de depuración para verificar parámetros
router.post('/debug-send', isAuthenticated, (req, res) => {
    try {
      console.log('Cuerpo de la solicitud:', req.body);
      console.log('Usuario en sesión:', req.session.user);
      
      res.send(`
        <h1>Datos de Depuración</h1>
        <h2>Cuerpo de la Solicitud</h2>
        <pre>${JSON.stringify(req.body, null, 2)}</pre>
        <h2>Usuario en Sesión</h2>
        <pre>${JSON.stringify(req.session.user, null, 2)}</pre>
        <a href="/chat">Volver a Chats</a>
      `);
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });

module.exports = router;