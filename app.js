const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Configuración de Handlebars
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secreto_de_sesion',
  resave: false,
  saveUninitialized: true
}));

// Rutas
app.use('/api', userRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.render('home');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});