// const User = require('../models/User');
// const bcrypt = require('bcrypt');

// exports.register = (req, res) => {
//   User.create(req.body, (err, userId) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al registrar el usuario' });
//     }
//     res.status(201).json({ message: 'Usuario registrado exitosamente', userId });
//   });
// };

// exports.login = (req, res) => {
//   User.findByEmail(req.body.email, (err, user) => {
//     if (err || !user) {
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }
//     bcrypt.compare(req.body.password, user.password, (err, result) => {
//       if (result) {
//         req.session.userId = user.id;
//         res.json({ message: 'Inicio de sesión exitoso' });
//       } else {
//         res.status(401).json({ error: 'Credenciales inválidas' });
//       }
//     });
//   });
// };

// exports.getAllUsers = (req, res) => {
//   User.getAll((err, users) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al obtener los usuarios' });
//     }
//     res.json(users);
//   });
// };

// exports.updateUser = (req, res) => {
//   User.update(req.params.id, req.body, (err, success) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al actualizar el usuario' });
//     }
//     if (success) {
//       res.json({ message: 'Usuario actualizado exitosamente' });
//     } else {
//       res.status(404).json({ error: 'Usuario no encontrado' });
//     }
//   });
// };

// exports.deleteUser = (req, res) => {
//   User.delete(req.params.id, (err, success) => {
//     if (err) {
//       return res.status(500).json({ error: 'Error al eliminar el usuario' });
//     }
//     if (success) {
//       res.json({ message: 'Usuario eliminado exitosamente' });
//     } else {
//       res.status(404).json({ error: 'Usuario no encontrado' });
//     }
//   });
// };

const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('users', { users });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al obtener los usuarios');
    res.redirect('/');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    await User.update(id, username, email);
    req.flash('success_msg', 'Usuario actualizado exitosamente');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al actualizar el usuario');
    res.redirect('/users');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.delete(id);
    req.flash('success_msg', 'Usuario eliminado exitosamente');
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Ocurrió un error al eliminar el usuario');
    res.redirect('/users');
  }
};