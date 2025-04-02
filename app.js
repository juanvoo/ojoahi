const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const { engine } = require('express-handlebars');
const path = require('path');
const i18n = require('i18n');
const Handlebars = require('handlebars');
const moment = require('moment');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const hbs = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Almacena usuarios conectados
const connectedUsers = new Map();

Handlebars.registerHelper('formatDate', function(date) {
  return new Date(date).toLocaleString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Configuración de Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    },
    lte: function(a, b) {
      return a <= b;
    },
    formatDate: function(date) {
      return new Date(date).toLocaleDateString();
    },
    formatTimeAgo: function(date) {
      if (!date) return '';
      
      const now = new Date();
      const messageDate = new Date(date);
      const diffMs = now - messageDate;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return `${diffDay}d`;
      } else if (diffHour > 0) {
        return `${diffHour}h`;
      } else if (diffMin > 0) {
        return `${diffMin}m`;
      } else {
        return 'ahora';
      }
    },
    formatTime: function(date) {
      if (!date) return '';
      
      const messageDate = new Date(date);
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    times: function(n, block) {
      let accum = '';
      for (let i = 0; i < n; ++i) {
        accum += block.fn(i);
      }
      return accum;
    },
    
    // Añadir el helper formatNumber
    formatNumber: function(number, decimals = 0) {
      if (number === null || number === undefined) return '0';
      
      // Convertir a número si es string
      const num = parseFloat(number);
      
      // Verificar si es un número válido
      if (isNaN(num)) return '0';
      
      // Formatear con el número de decimales especificado
      return num.toFixed(decimals);
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

// Configuración de flash messages
app.use(flash());

// Configuración de i18n
i18n.configure({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  updateFiles: false,
  cookie: 'lang'
});
app.use(i18n.init);

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Manejar la autenticación del usuario
  socket.on('userAuthenticated', (userId) => {
    connectedUsers.set(userId, socket.id);
    io.emit('userStatusChanged', {
      userId: userId,
      status: 'online'
    });
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    // Encontrar y eliminar usuario desconectado
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        io.emit('userStatusChanged', {
          userId: userId,
          status: 'offline'
        });
        break;
      }
    }
  });
});

// Middleware para hacer __ accesible en las vistas
app.use((req, res, next) => {
  res.locals.__ = res.__ = function() {
    return i18n.__.apply(req, arguments);
  };
  next();
});

// Middleware para hacer el usuario disponible en todas las vistas
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// Middleware para hacer io accesible en las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboards');
const creatorsRoutes = require('./routes/creators');
const aboutRoutes = require('./routes/about');
const opinionsRoutes = require ('./routes/opinions');
// const helpRoutes = require ('./routes/help');
const helpRequestRoutes = require('./routes/helpRequests');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const supportRoutes = require('./routes/support');

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/', dashboardRoutes);
app.use('/', creatorsRoutes);
app.use('/', aboutRoutes);
app.use('/', opinionsRoutes);
// app.use('/', helpRoutes);
app.use('/reviews', reviewRoutes);
app.use('/help-requests', helpRequestRoutes);
app.use('/reservations', reservationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/chat', chatRoutes);

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404: Página no encontrada' });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '500: Error del servidor' });
});

app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  createParentPath: true,
  useTempFiles: true, // Usar archivos temporales para mejorar el rendimiento
  tempFileDir: '/tmp/', // Directorio para archivos temporales
  debug: true // Activar modo debug para ver más información
}));

// Inicializar tablas
const Message = require('./models/Message');
Message.createTable().catch(console.error);

// Inicializar tablas
const Notification = require('./models/Notification');
Notification.createTable().catch(console.error);

// Inicializar tablas
const SupportChat = require('./models/SupportChat');
const FAQ = require('./models/FAQ');

// Crear tablas si no existen
SupportChat.createTable().catch(console.error);
FAQ.createTable().catch(console.error);

// Usar rutas de soporte
app.use('/support', supportRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
module.exports = app;