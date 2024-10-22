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
  secret: process.env.SESSION_SECRET || 'losBrunos3',
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