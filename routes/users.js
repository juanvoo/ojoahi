const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.session.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${userId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Controladores
const userController = require('../controllers/userController');

// Rutas de dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userRole = req.session.user.role;
    
    // Obtener notificaciones
    const Notification = require('../models/Notification');
    const notifications = await Notification.getByUserId(userId);

    // Obtener conteo de mensajes no leídos
    const Message = require('../models/Message');
    const unreadMessages = await Message.getUnreadCount(userId);
    
    if (userRole === 'volunteer') {
      // Dashboard para voluntarios
      console.log(`Buscando reservas para el voluntario con ID: ${userId}`);
      
      const Reservation = require('../models/Reservation');
      const Review = require('../models/Review');
      const HelpRequest = require('../models/HelpRequest');
      
      const reservations = await Reservation.getByVolunteerId(userId);
      
      // Obtener descripciones de solicitudes de ayuda si es posible
      for (let reservation of reservations) {
        try {
          // Si existe una relación con help_requests, intentar obtener la descripción
          if (reservation.help_request_id) {
            const helpRequest = await HelpRequest.findById(reservation.help_request_id);
            if (helpRequest) {
              reservation.description = helpRequest.description;
            }
          }
          
          // Si no hay descripción, usar un valor predeterminado
          if (!reservation.description) {
            reservation.description = reservation.notes || 'Sin descripción';
          }
        } catch (error) {
          console.error('Error al obtener la descripción de la solicitud:', error);
          reservation.description = 'Sin descripción';
        }
      }
      
      const reviews = await Review.getByVolunteerId(userId);
      const { averageRating, totalReviews } = await Review.getAverageRatingByVolunteerId(userId);
      
      let pendingRequests = [];
      try {
        pendingRequests = await HelpRequest.getPendingByVolunteerId(userId);
      } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
      }
      
      console.log(`Reservas encontradas para voluntario: ${reservations.length}`);
      console.log(`Reseñas encontradas para voluntario: ${reviews.length}`);
      console.log(`Solicitudes pendientes encontradas: ${pendingRequests.length || 0}`);
      
      return res.render('dashboard/volunteer', {
        user: req.session.user,
        reservations,
        reviews,
        averageRating,
        totalReviews,
        pendingRequests,
        notifications,
        unreadMessages,
        title: 'Dashboard'
      });
    } else if (userRole === 'blind') {
      // Dashboard para usuarios ciegos
      console.log(`Buscando reservas para el usuario ciego con ID: ${userId}`);
      
      const Reservation = require('../models/Reservation');
      const HelpRequest = require('../models/HelpRequest');
      
      const reservations = await Reservation.getByUserId(userId);
      const pendingRequests = await HelpRequest.getByUserId(userId);
      
      console.log(`Reservas encontradas para usuario ciego: ${reservations.length}`);
      console.log(`Solicitudes pendientes encontradas: ${pendingRequests.length}`);
      
      return res.render('dashboard/blind', {
        user: req.session.user,
        reservations,
        pendingRequests,
        notifications,
        unreadMessages,
        title: 'Dashboard'
      });
    } else {
      // Rol no reconocido
      req.flash('error_msg', 'Rol de usuario no válido');
      return res.redirect('/auth/login');
    }
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    req.flash('error_msg', 'Error al cargar el dashboard');
    res.redirect('/auth/login');
  }
});

// Rutas de perfil (sistema original)
router.get('/profile', isAuthenticated, userController.getProfile);
router.get('/profile/edit', isAuthenticated, userController.getEditProfile);
router.post('/profile/edit', isAuthenticated, userController.postEditProfile);
router.get('/profile/change-password', isAuthenticated, userController.getChangePassword);
router.post('/profile/change-password', isAuthenticated, userController.postChangePassword);

// Nuevo sistema de perfil
router.get('/new-profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Obtener datos directamente de la base de datos
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.send('Usuario no encontrado');
    }
    
    const user = rows[0];
    
    // Renderizar una vista simple sin usar el sistema de plantillas
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mi Perfil</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          .avatar-container {
            width: 150px;
            height: 150px;
            margin: 0 auto;
            overflow: hidden;
            border-radius: 50%;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #e0e0e0;
          }
          .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .default-avatar {
            color: #aaa;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="container mt-4">
          <div class="row">
            <div class="col-md-8 mx-auto">
              <div class="card">
                <div class="card-header bg-primary text-white">
                  <h2>Mi Perfil</h2>
                </div>
                <div class="card-body">
                  <div class="row mb-4">
                    <div class="col-md-4 text-center">
                      <div class="avatar-container mb-3">
                        ${user.profile_image ? 
                          `<img src="${user.profile_image}" alt="Foto de perfil" class="img-fluid rounded-circle profile-image">` : 
                          `<div class="default-avatar"><i class="fas fa-user fa-5x"></i></div>`
                        }
                      </div>
                      <h4>${user.username}</h4>
                      <p class="badge bg-${user.role === 'blind' ? 'info' : 'success'}">
                        ${user.role === 'blind' ? 'Usuario' : 'Voluntario'}
                      </p>
                    </div>
                    <div class="col-md-8">
                      <table class="table">
                        <tr>
                          <th>ID:</th>
                          <td>${user.id}</td>
                        </tr>
                        <tr>
                          <th>Nombre de usuario:</th>
                          <td>${user.username}</td>
                        </tr>
                        ${user.name ? `
                        <tr>
                          <th>Nombre completo:</th>
                          <td>${user.name}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <th>Email:</th>
                          <td>${user.email}</td>
                        </tr>
                        ${user.phone ? `
                        <tr>
                          <th>Teléfono:</th>
                          <td>${user.phone}</td>
                        </tr>
                        ` : ''}
                        ${user.address ? `
                        <tr>
                          <th>Dirección:</th>
                          <td>${user.address}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <th>Fecha de registro:</th>
                          <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                        ${user.role === 'volunteer' && user.bio ? `
                        <tr>
                          <th>Biografía:</th>
                          <td>${user.bio}</td>
                        </tr>
                        ` : ''}
                        ${user.role === 'volunteer' && user.availability ? `
                        <tr>
                          <th>Disponibilidad:</th>
                          <td>${user.availability}</td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>
                  </div>
                  <div class="text-center">
                    <a href="/users/new-profile/edit" class="btn btn-primary">Editar Perfil</a>
                    <a href="/users/dashboard" class="btn btn-secondary">Volver al Dashboard</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error al cargar el nuevo perfil:', error);
    res.status(500).send('Error al cargar el perfil: ' + error.message);
  }
});

router.get('/new-profile/edit', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Obtener datos directamente de la base de datos
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.send('Usuario no encontrado');
    }
    
    const user = rows[0];
    
    // Renderizar un formulario que incluya la opción de subir una foto
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Editar Perfil</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          .avatar-container {
            width: 150px;
            height: 150px;
            margin: 0 auto;
            overflow: hidden;
            border-radius: 50%;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #e0e0e0;
          }
          .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .default-avatar {
            color: #aaa;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="container mt-4">
          <div class="row">
            <div class="col-md-8 mx-auto">
              <div class="card">
                <div class="card-header bg-primary text-white">
                  <h2>Editar Perfil (Nueva Vista)</h2>
                </div>
                <div class="card-body">
                  <form action="/users/new-profile/edit" method="POST" enctype="multipart/form-data">
                    <div class="row mb-4">
                      <div class="col-md-4 text-center">
                        <div class="avatar-container mb-3">
                          ${user.profile_image ? 
                            `<img src="${user.profile_image}" alt="Foto de perfil" class="img-fluid rounded-circle profile-image" id="profile-preview">` : 
                            `<div class="default-avatar" id="default-avatar"><i class="fas fa-user fa-5x"></i></div>
                             <img src="/placeholder.svg" alt="Foto de perfil" class="img-fluid rounded-circle profile-image" id="profile-preview" style="display: none;">`
                          }
                        </div>
                        <div class="mb-3">
                          <label for="profile_image" class="form-label">Foto de perfil</label>
                          <input type="file" class="form-control" id="profile_image" name="profile_image" accept="image/*">
                          <small class="text-muted">Selecciona una imagen para tu perfil (máximo 5MB).</small>
                        </div>
                      </div>
                      <div class="col-md-8">
                        <div class="mb-3">
                          <label for="username" class="form-label">Nombre de usuario</label>
                          <input type="text" class="form-control" id="username" name="username" value="${user.username}" required>
                        </div>
                        <div class="mb-3">
                          <label for="name" class="form-label">Nombre completo</label>
                          <input type="text" class="form-control" id="name" name="name" value="${user.name || ''}">
                        </div>
                        <div class="mb-3">
                          <label for="email" class="form-label">Email</label>
                          <input type="email" class="form-control" id="email" name="email" value="${user.email}" required>
                        </div>
                        <div class="mb-3">
                          <label for="phone" class="form-label">Teléfono</label>
                          <input type="tel" class="form-control" id="phone" name="phone" value="${user.phone || ''}">
                        </div>
                        <div class="mb-3">
                          <label for="address" class="form-label">Dirección</label>
                          <textarea class="form-control" id="address" name="address" rows="2">${user.address || ''}</textarea>
                        </div>
                        
                        ${user.role === 'volunteer' ? `
                        <div class="mb-3">
                          <label for="bio" class="form-label">Biografía</label>
                          <textarea class="form-control" id="bio" name="bio" rows="3">${user.bio || ''}</textarea>
                          <small class="text-muted">Cuéntanos sobre ti y tu experiencia como voluntario.</small>
                        </div>
                        <div class="mb-3">
                          <label for="availability" class="form-label">Disponibilidad</label>
                          <textarea class="form-control" id="availability" name="availability" rows="2">${user.availability || ''}</textarea>
                          <small class="text-muted">Indica tus horarios de disponibilidad.</small>
                        </div>
                        ` : ''}
                      </div>
                    </div>
                    <div class="text-center">
                      <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                      <a href="/users/new-profile" class="btn btn-secondary">Cancelar</a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
        <script>
          // Vista previa de la imagen
          document.getElementById('profile_image').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = function(e) {
                const preview = document.getElementById('profile-preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                
                const defaultAvatar = document.getElementById('default-avatar');
                if (defaultAvatar) {
                  defaultAvatar.style.display = 'none';
                }
              }
              reader.readAsDataURL(file);
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    res.status(500).send('Error al cargar el formulario: ' + error.message);
  }
});

router.post('/new-profile/edit', isAuthenticated, upload.single('profile_image'), async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { username, name, email, phone, address, bio, availability } = req.body;
    
    console.log('Datos recibidos para actualización (nueva ruta):', req.body);
    console.log('Archivo recibido:', req.file);
    
    // Actualizar directamente en la base de datos
    const pool = require('../config/database');
    
    // Verificar si el email o username ya están en uso
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (emailCheck.length > 0) {
        return res.send('El email ya está en uso por otro usuario. <a href="/users/new-profile/edit">Volver</a>');
      }
    }
    
    if (username) {
      const [usernameCheck] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      
      if (usernameCheck.length > 0) {
        return res.send('El nombre de usuario ya está en uso. <a href="/users/new-profile/edit">Volver</a>');
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
    
    // Manejar la imagen subida si existe
    if (req.file) {
      const profileImagePath = `/uploads/profiles/${req.file.filename}`;
      
      console.log('Ruta de la imagen para la base de datos:', profileImagePath);
      
      // Añadir la actualización de la imagen a la consulta SQL
      if (columnNames.includes('profile_image')) {
        updateFields.push('profile_image = ?');
        params.push(profileImagePath);
      }
    }
    
    // Si no hay campos para actualizar, redirigir
    if (updateFields.length === 0) {
      return res.send('No se realizaron cambios. <a href="/users/new-profile">Volver al perfil</a>');
    }
    
    // Añadir la fecha de actualización si existe
    if (columnNames.includes('updated_at')) {
      updateFields.push('updated_at = NOW()');
    }
    
    sql += updateFields.join(', ');
    sql += ' WHERE id = ?';
    params.push(userId);
    
    console.log('SQL de actualización (nueva ruta):', sql);
    console.log('Parámetros (nueva ruta):', params);
    
    await pool.execute(sql, params);
    
    // Obtener los datos actualizados
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Actualizar la sesión con los datos más recientes
    req.session.user = rows[0];
    
    // Redirigir a la página de perfil con un mensaje de éxito
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Perfil Actualizado</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="container mt-5">
          <div class="alert alert-success">
            <h4>¡Perfil actualizado correctamente!</h4>
            <p>Todos los cambios han sido guardados.</p>
            ${req.file ? '<p>La imagen de perfil ha sido actualizada.</p>' : ''}
          </div>
          <p>Serás redirigido a tu perfil en 3 segundos...</p>
          <a href="/users/new-profile" class="btn btn-primary">Ir a mi perfil ahora</a>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = '/users/new-profile';
          }, 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error al actualizar el perfil (nueva ruta):', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="container mt-5">
          <div class="alert alert-danger">
            <h4>Error al actualizar el perfil</h4>
            <p>${error.message}</p>
          </div>
          <a href="/users/new-profile/edit" class="btn btn-primary">Volver a intentarlo</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Ruta para refrescar la sesión
router.get('/profile/refresh', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (rows.length > 0) {
      req.session.user = rows[0];
      req.session.save(err => {
        if (err) {
          console.error('Error al guardar la sesión:', err);
        }
        res.redirect('/users/profile');
      });
    } else {
      req.flash('error_msg', 'No se pudo actualizar la sesión');
      res.redirect('/users/profile');
    }
  } catch (error) {
    console.error('Error al refrescar los datos del usuario:', error);
    req.flash('error_msg', 'Error al refrescar los datos');
    res.redirect('/users/profile');
  }
});

// Lista de voluntarios disponibles
router.get('/volunteers', isAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'blind') {
      req.flash('error_msg', 'Acceso no autorizado');
      return res.redirect('/users/dashboard');
    }

    const pool = require('../config/database');
    
    // Obtener todos los voluntarios con sus calificaciones promedio
    const [volunteers] = await pool.execute(`
      SELECT u.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_reviews
      FROM users u
      LEFT JOIN reviews r ON u.id = r.volunteer_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id
      ORDER BY average_rating DESC
    `);

    res.render('users/volunteer-list', {
      user: req.session.user,
      volunteers,
      title: 'Voluntarios Disponibles'
    });
  } catch (error) {
    console.error('Error al cargar la lista de voluntarios:', error);
    req.flash('error_msg', 'Error al cargar la lista de voluntarios');
    res.redirect('/users/dashboard');
  }
});

// Ver perfil de un voluntario específico
router.get('/volunteers/:id', isAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'blind') {
      req.flash('error_msg', 'Acceso no autorizado');
      return res.redirect('/users/dashboard');
    }

    const volunteerId = req.params.id;
    const pool = require('../config/database');
    
    // Obtener información del voluntario
    const [volunteerRows] = await pool.execute(`
      SELECT u.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_reviews
      FROM users u
      LEFT JOIN reviews r ON u.id = r.volunteer_id
      WHERE u.id = ? AND u.role = 'volunteer'
      GROUP BY u.id
    `, [volunteerId]);

    if (volunteerRows.length === 0) {
      req.flash('error_msg', 'Voluntario no encontrado');
      return res.redirect('/users/volunteers');
    }

    const volunteer = volunteerRows[0];
    
    // Obtener reseñas del voluntario
    const [reviews] = await pool.execute(`
      SELECT r.*, u.username, u.profile_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.volunteer_id = ?
      ORDER BY r.created_at DESC
    `, [volunteerId]);

    // Verificar si el usuario ya tiene una solicitud pendiente con este voluntario
    const [pendingRequests] = await pool.execute(`
      SELECT * FROM help_requests 
      WHERE user_id = ? AND volunteer_id = ? AND status = 'pending'
    `, [req.session.user.id, volunteerId]);

    const hasPendingRequest = pendingRequests.length > 0;

    res.render('users/volunteer-profile', {
      user: req.session.user,
      volunteer,
      reviews,
      hasPendingRequest,
      title: `Perfil de ${volunteer.username}`
    });
  } catch (error) {
    console.error('Error al cargar el perfil del voluntario:', error);
    req.flash('error_msg', 'Error al cargar el perfil del voluntario');
    res.redirect('/users/volunteers');
  }
});

module.exports = router;