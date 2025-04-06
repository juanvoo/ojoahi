const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const HelpRequest = require('../models/HelpRequest');

exports.getDashboard = async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Por favor inicia sesión para acceder');
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    
    console.log(`Usuario ${userId} (${req.session.user.username}) con rol ${userRole} accediendo al dashboard`);

    if (userRole === 'blind') {
      // Dashboard para usuarios ciegos
      console.log(`Buscando reservas y reseñas para el usuario ciego con ID: ${userId}`);
      const helpRequests = await HelpRequest.getByUserId(userId);
      const reviews = await Review.getByUserId(userId);
      
      console.log(`Solicitudes/Reservas encontradas para usuario ciego: ${helpRequests.length}`);
      console.log(`Reseñas encontradas para usuario ciego: ${reviews.length}`);
      
      return res.render('dashboard/blind', {
        user: req.session.user,
        reservations: helpRequests,
        reviews,
        notifications,
        unreadMessages,
        title: 'Dashboard'
      });
    } else if (userRole === 'volunteer') {
      // Dashboard para voluntarios
      console.log(`Buscando reservas para el voluntario con ID: ${userId}`);
      
      // Consulta directa a la base de datos para verificar
      const pool = require('../config/database');
      const [directReservations] = await pool.execute(
        'SELECT * FROM reservations WHERE volunteer_id = ?',
        [userId]
      );
      console.log(`Consulta directa - Reservas encontradas: ${directReservations.length}`);
      if (directReservations.length > 0) {
        console.log('Primera reserva:', JSON.stringify(directReservations[0]));
      }
      
      const reservations = await Reservation.getByVolunteerId(userId);
      const reviews = await Review.getByVolunteerId(userId);
      const pendingRequests = await HelpRequest.getPendingByVolunteerId(userId);
      
      console.log(`Reservas encontradas para voluntario: ${reservations.length}`);
      console.log(`Reseñas encontradas para voluntario: ${reviews.length}`);
      console.log(`Solicitudes pendientes encontradas: ${pendingRequests.length}`);
      
      return res.render('dashboard/volunteer', {
        user: req.session.user,
        reservations,
        reviews,
        pendingRequests,
        title: 'Dashboard'
      });
    }

    req.flash('error_msg', 'Tipo de usuario no válido');
    return res.redirect('/login');
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    req.flash('error_msg', 'Error al cargar el dashboard');
    res.redirect('/login');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const forceRefresh = req.query.refresh === 'true';
    
    // Si se solicita un refresco forzado, limpiar la caché de la sesión
    if (forceRefresh) {
      delete req.session.user;
      req.session.save();
    }
    
    // Obtener datos directamente de la base de datos
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/users/dashboard');
    }
    
    const user = rows[0];
    
    // Obtener estadísticas si es un voluntario
    let stats = {};
    if (user.role === 'volunteer') {
      // Obtener estadísticas...
    }
    
    // Actualizar la sesión con los datos más recientes
    req.session.user = user;
    
    res.render('users/profile', {
      title: 'Mi Perfil',
      user,
      ...stats
    });
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    req.flash('error_msg', 'Error al cargar el perfil');
    res.redirect('/users/dashboard');
  }
};

exports.getEditProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Obtener datos directamente de la base de datos
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/users/dashboard');
    }
    
    const user = rows[0];
    
    res.render('users/edit-profile', {
      title: 'Editar Perfil',
      user
    });
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    req.flash('error_msg', 'Error al cargar el formulario');
    res.redirect('/users/profile');
  }
};

// En controllers/userController.js - Método postEditProfile
exports.postEditProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { username, name, email, phone, address, bio, availability } = req.body;
    
    console.log('Datos recibidos para actualización:', req.body);
    
    // Verificar si el email o username ya están en uso
    const pool = require('../config/database');
    
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (emailCheck.length > 0) {
        throw new Error('El email ya está en uso por otro usuario');
      }
    }
    
    if (username) {
      const [usernameCheck] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      
      if (usernameCheck.length > 0) {
        throw new Error('El nombre de usuario ya está en uso');
      }
    }
    
    // Obtener las columnas disponibles
    const [columns] = await pool.execute('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);
    
    // Construir la consulta SQL dinámicamente
    let sql = 'UPDATE users SET ';
    const updateFields = [];
    const params = [];
    
    // Solo incluir campos que existen en la tabla
    if (username && columnNames.includes('username')) {
      updateFields.push('username = ?');
      params.push(username);
    }
    
    if (columnNames.includes('name')) {
      updateFields.push('name = ?');
      params.push(name || '');
    }
    
    if (email && columnNames.includes('email')) {
      updateFields.push('email = ?');
      params.push(email);
    }
    
    if (columnNames.includes('phone')) {
      updateFields.push('phone = ?');
      params.push(phone || '');
    }
    
    if (columnNames.includes('address')) {
      updateFields.push('address = ?');
      params.push(address || '');
    }
    
    if (columnNames.includes('bio')) {
      updateFields.push('bio = ?');
      params.push(bio || '');
    }
    
    if (columnNames.includes('availability')) {
      updateFields.push('availability = ?');
      params.push(availability || '');
    }
    
    // Si no hay campos para actualizar, devolver el usuario actual
    if (updateFields.length === 0) {
      req.flash('info_msg', 'No se realizaron cambios');
      return res.redirect('/users/profile');
    }
    
    // Añadir la fecha de actualización si existe
    if (columnNames.includes('updated_at')) {
      updateFields.push('updated_at = NOW()');
    }
    
    sql += updateFields.join(', ');
    sql += ' WHERE id = ?';
    params.push(userId);
    
    console.log('SQL de actualización:', sql);
    console.log('Parámetros:', params);
    
    await pool.execute(sql, params);
    
    // Manejar la subida de imagen si existe
    if (req.files && req.files.profile_image) {
      const profileImage = req.files.profile_image;
      const uploadDir = path.join(__dirname, '../public/uploads/profiles');
      
      // Crear el directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const uploadPath = path.join(uploadDir, `${userId}_${Date.now()}${path.extname(profileImage.name)}`);
      
      // Mover la imagen al directorio de uploads
      await profileImage.mv(uploadPath);
      
      // Actualizar la ruta de la imagen en la base de datos
      const imagePath = `/uploads/profiles/${path.basename(uploadPath)}`;
      await pool.execute(
        'UPDATE users SET profile_image = ? WHERE id = ?',
        [imagePath, userId]
      );
    }
    
    // Obtener los datos actualizados
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Actualizar la sesión con los datos más recientes
    req.session.user = rows[0];
    
    // Guardar la sesión explícitamente
    req.session.save(err => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
      }
      
      req.flash('success_msg', 'Perfil actualizado correctamente');
      res.redirect('/users/profile');
    });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    req.flash('error_msg', error.message || 'Error al actualizar el perfil');
    res.redirect('/users/profile/edit');
  }
};

exports.getChangePassword = (req, res) => {
  res.render('users/change-password', {
    title: 'Cambiar Contraseña'
  });
};

exports.postChangePassword = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { current_password, new_password, confirm_password } = req.body;
    
    // Validar que las contraseñas coincidan
    if (new_password !== confirm_password) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/users/profile/change-password');
    }
    
    // Validar longitud mínima
    if (new_password.length < 6) {
      req.flash('error_msg', 'La contraseña debe tener al menos 6 caracteres');
      return res.redirect('/users/profile/change-password');
    }
    
    // Cambiar la contraseña
    await User.changePassword(userId, current_password, new_password);
    
    req.flash('success_msg', 'Contraseña cambiada correctamente');
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    req.flash('error_msg', error.message || 'Error al cambiar la contraseña');
    res.redirect('/users/profile/change-password');
  }
};