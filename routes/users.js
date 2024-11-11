const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);
router.get('/:id', isAuthenticated, userController.getUserById);
router.post('/', isAuthenticated, isAdmin, userController.createUser);
router.put('/:id', isAuthenticated, userController.updateUser);
router.post('/delete-account', isAuthenticated, userController.deleteAccount);
router.get('/blind-dashboard', isAuthenticated, userController.getBlindDashboard);
router.get('/volunteer-dashboard', isAuthenticated, userController.getVolunteerDashboard);



module.exports = router;