const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validación básica
    if (!email || !password) {
      req.flash('error_msg', 'Por favor, ingresa email y contraseña');
      return res.redirect('/login');
    }
    
    // Buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      req.flash('error_msg', 'Email o contraseña incorrectos');
      return res.redirect('/login');
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Email o contraseña incorrectos');
      return res.redirect('/login');
    }
    
    // Guardar usuario en sesión
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin
    };
    
    console.log(`Usuario ${user.username} (ID: ${user.id}) ha iniciado sesión. Rol: ${user.role}`);
    
    req.flash('success_msg', 'Has iniciado sesión exitosamente');
    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Error en el login:', error);
    req.flash('error_msg', 'Error en el inicio de sesión');
    res.redirect('/login');
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('Datos recibidos:', req.body);
    
    // Validación básica
    if (!username || !email || !password || !role) {
      req.flash('error_msg', 'Por favor, rellena todos los campos');
      return res.redirect('/register');
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'El email ya está registrado');
      return res.redirect('/register');
    }

    // Crear nuevo usuario
    const userId = await User.create({ 
      username, 
      email, 
      password, 
      role,
      user_type: role // Asegurarse de que user_type y role sean iguales
    });
    console.log('Usuario creado con ID:', userId);
    
    req.flash('success_msg', 'Te has registrado exitosamente');
    res.redirect('/login');
  } catch (error) {
    console.error('Error en el registro:', error);
    req.flash('error_msg', 'Error en el registro');
    res.redirect('/register');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/users/dashboard');
    }
    res.redirect('/login');
  });
};