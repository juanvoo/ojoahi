// const express = require('express');
// const exphbs = require('express-handlebars');
// const session = require('express-session');
// const path = require('path');
// const userRoutes = require('./routes/userRoutes');
// const loginRoutes = require('./routes/index')

// const app = express();
// app.set('port', 3000);

// // Configuración de Handlebars
// app.set('views', path.join(__dirname, 'views'));
// app.engine('.hbs', exphbs({
// 	extname: '.hbs',
// }));
// app.set('view engine', 'hbs');

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//   secret: 'secreto_de_sesion',
//   resave: false,
//   saveUninitialized: true
// }));

// // Rutas
// app.use('/api', userRoutes);

// // Ruta principal
// app.get('/', (req, res) => {
//   res.render('home');
// });

// app.use('/', loginRoutes);

// // Iniciar el servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });


// const express = require('express');
// // const exphbs = require('express-handlebars');
// const { engine } = require('express-handlebars');
// const session = require('express-session');
// const flash = require('connect-flash');
// const path = require('path');
// const http = require('http');
// const socketIo = require('socket.io');
// const i18n = require('i18n');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// // Configuración de Handlebars
// app.engine('hbs', engine({
//   defaultLayout: 'main',
//   extname: '.hbs',
//   helpers: {
//     formatDate: (date) => {
//       return new Date(date).toLocaleDateString('es-ES');
//     }
//   }
// }));
// app.set('view engine', 'hbs');

// // i18n configuration
// i18n.configure({
//   locales: ['es', 'en'],
//   directory: path.join(__dirname, 'locales'),
//   defaultLocale: 'es',
//   cookie: 'lang',
// });

// // Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: process.env.NODE_ENV === 'production' }
// }));

// // Flash messages middleware
// app.use(flash());

// // Make user data available to all views
// app.use((req, res, next) => {
//   res.locals.user = req.session.user || null;
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   next();
// });

// // Socket.IO logic for WebRTC signaling
// io.on('connection', (socket) => {
//   socket.on('join-room', (roomId, userId) => {
//     socket.join(roomId);
//     socket.to(roomId).broadcast.emit('user-connected', userId);

//     socket.on('disconnect', () => {
//       socket.to(roomId).broadcast.emit('user-disconnected', userId);
//     });
//   });
// });

// // Variables globales
// app.use((req, res, next) => {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.user = req.session.user || null;
//   next();
// });

// // Rutas
// app.use('/', require('./routes/auth'));
// app.use('/users', require('./routes/users'));
// app.use('/reservations', require('./routes/reservations'));
// app.use('/reviews', require('./routes/reviews'));
// app.use('/messages', require('./routes/messages'));

// // Route to change language
// app.get('/change-lang/:lang', (req, res) => {
//   res.cookie('lang', req.params.lang, { maxAge: 900000, httpOnly: true });
//   res.redirect('back');
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));

const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const i18n = require('i18n');
require('dotenv').config();

const app = express();

// i18n configuration
i18n.configure({
  locales: ['es', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'es',
  cookie: 'lang',
});

// Handlebars configuration
app.engine('hbs', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    __: function() {
      return i18n.__.apply(this, arguments);
    },
    __n: function() {
      return i18n.__n.apply(this, arguments);
    },
    formatDate: (date) => {
      return new Date(date).toLocaleDateString('es-ES');
    }
  }
}));
app.set('view engine', 'hbs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());
app.use(i18n.init);

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/reservations', require('./routes/reservations'));
app.use('/reviews', require('./routes/reviews'));
app.use('/', require('./routes/auth'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));