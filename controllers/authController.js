const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'El correo electrónico ya está registrado');
      return res.redirect('/register');
    }
    await User.create(username, email, password);
    req.flash('success_msg', 'Te has registrado exitosamente');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error durante el registro');
    res.redirect('/register');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error_msg', 'Credenciales inválidas');
      return res.redirect('/login');
    }
    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error durante el inicio de sesión');
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/login');
  });
};