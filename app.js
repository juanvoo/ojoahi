const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const { engine } = require('express-handlebars');
const path = require('path');
const i18n = require('i18n');
const Handlebars = require('handlebars');

const app = express();

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
app.engine('.hbs', engine({ 
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    eq: function (v1, v2) {
      return v1 === v2;
    }
  }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
  secret: 'tu_secreto_aqui',
  resave: false,
  saveUninitialized: true
}));

// Configuración de flash messages
app.use(flash());

// Configuración de i18n
i18n.configure({
  locales: ['es', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'es',
  cookie: 'lang',
});
app.use(i18n.init);

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

// Parseo de body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboards');
const creatorsRoutes = require('./routes/creators');
const aboutRoutes = require('./routes/about');
const opinionsRoutes = require ('./routes/opinions');
const helpRoutes = require ('./routes/help');
const reviewRoutes = require('./routes/reviews');

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/', dashboardRoutes);
app.use('/', creatorsRoutes);
app.use('/', aboutRoutes);
app.use('/', opinionsRoutes);
app.use('/', helpRoutes);
app.use('/reviews', reviewRoutes);

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404: Página no encontrada' });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '500: Error del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

module.exports = app;