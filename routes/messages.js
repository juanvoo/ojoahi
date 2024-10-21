const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/:userId', isAuthenticated, messageController.getConversation);
router.post('/send', isAuthenticated, messageController.sendMessage);

module.exports = router;