const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');

router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register', { title: 'Registrarse en OjoAhi' });
});

router.post('/register', isNotAuthenticated, authController.register);

router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { title: 'Iniciar Sesión en OjoAhi' });
});

router.post('/login', isNotAuthenticated, authController.login);

router.get('/logout', authController.logout);

module.exports = router;