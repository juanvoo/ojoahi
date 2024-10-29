const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, email, password, confirmPassword, userType } = req.body;

  try {
    console.log('Datos recibidos:', { username, email, password: password ? 'Provided' : 'Not provided', confirmPassword: confirmPassword ? 'Provided' : 'Not provided', userType });
    
    if (!username || !email || !password || !confirmPassword || !userType) {
      console.log('Campos faltantes:', {
        username: !username,
        email: !email,
        password: !password,
        confirmPassword: !confirmPassword,
        userType: !userType
      });
      req.flash('error_msg', 'Todos los campos son requeridos');
      return res.render('register', {
        title: 'Registro',
        username,
        email,
        userType
      });
    }

    if (password !== confirmPassword) {
      console.log('Las contraseñas no coinciden');
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.render('register', {
        title: 'Registro',
        username,
        email,
        userType
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('El email ya está registrado');
      req.flash('error_msg', 'El email ya está registrado');
      return res.render('register', {
        title: 'Registro',
        username,
        email,
        userType
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      user_type: userType
    });

    console.log('Usuario registrado exitosamente:', newUser);
    req.flash('success_msg', 'Te has registrado exitosamente');
    res.redirect('/login');
  } catch (error) {
    console.error('Error en el registro:', error);
    req.flash('error_msg', 'Error en el registro: ' + error.message);
    res.render('register', {
      title: 'Registro',
      username,
      email,
      userType
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Por favor, ingresa email y contraseña');
      return res.render('login', { title: 'Iniciar Sesión' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      req.flash('error_msg', 'El email no está registrado');
      return res.render('login', { title: 'Iniciar Sesión', email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Contraseña incorrecta');
      return res.render('login', { title: 'Iniciar Sesión', email });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      userType: user.user_type
    };

    res.redirect(user.user_type === 'blind' ? '/blind-dashboard' : '/volunteer-dashboard');
  } catch (error) {
    console.error('Error en el login:', error);
    req.flash('error_msg', 'Error en el inicio de sesión');
    res.render('login', { title: 'Iniciar Sesión' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
};