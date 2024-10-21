const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
});

// Login handle
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      req.flash('success_msg', 'Has iniciado sesión correctamente');
      res.redirect('/');
    } else {
      req.flash('error_msg', 'Email o contraseña incorrectos');
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error durante el inicio de sesión');
    res.redirect('/login');
  }
});

// Logout handle
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Registro' });
});

// Register handle
router.post('/register', async (req, res) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Por favor rellena todos los campos' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Las contraseñas no coinciden' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      title: 'Registro'
    });
  } else {
    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        errors.push({ msg: 'El email ya está registrado' });
        res.render('register', {
          errors,
          username,
          email,
          title: 'Registro'
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(username, email, hashedPassword);
        req.flash('success_msg', 'Ahora estás registrado y puedes iniciar sesión');
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Ocurrió un error durante el registro');
      res.redirect('/register');
    }
  }
});

module.exports = router;