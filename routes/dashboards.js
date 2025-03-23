const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const volunteerController = require('../controllers/volunteerController');
const helpRequestController = require('../controllers/helpRequestController');

router.get('/blind-dashboard', isAuthenticated, (req, res) => {
  if (req.session.user.userType !== 'blind') {
    return res.redirect('/volunteer-dashboard');
  }
  res.render('blind-dashboard', { title: 'Su Dashboard', user: req.session.user });
});

router.get('/volunteer-dashboard', isAuthenticated, (req, res) => {
  if (req.session.user.userType !== 'volunteer') {
    return res.redirect('/blind-dashboard');
  }
  res.render('volunteer-dashboard', { title: 'Su Dashboard', user: req.session.user });
});

// // Nueva ruta para la lista de voluntarios
// router.get('/volunteerList', isAuthenticated, (req, res, next) => {
//   if (req.session.user.userType !== 'blind') {
//     return res.redirect('/volunteer-dashboard');
//   }
//   next();
// }, volunteerController.getAllVolunteers);

// router.get('/request-help/:volunteerId', isAuthenticated, (req, res, next) => {
//   if (req.session.user.userType !== 'blind') {
//     return res.redirect('/volunteer-dashboard');
//   }
//   next();
// }, helpRequestController.showRequestForm);

// router.post('/request-help', isAuthenticated, (req, res, next) => {
//   if (req.session.user.userType !== 'blind') {
//     return res.redirect('/volunteer-dashboard');
//   }
//   next();
// }, helpRequestController.submitRequest);

module.exports = router;