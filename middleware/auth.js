// middleware/auth.js

exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Por favor inicia sesión para acceder a esta página');
    res.redirect('/login');
  };
  
  exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
      return next();
    }
    req.flash('error_msg', 'No tienes permiso para acceder a esta página');
    res.redirect('/');
  };