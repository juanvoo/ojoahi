module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Por favor, inicia sesión para acceder');
    res.redirect('/login');
  },
  
  isNotAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return res.redirect('/dashboard');
    }
    next();
  },
  
  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.userType === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Acceso denegado' });
  }
};