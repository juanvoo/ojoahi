exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Por favor, inicia sesión para acceder');
  res.redirect('/login');
};

exports.isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect('/');
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.userType === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Acceso denegado' });
};