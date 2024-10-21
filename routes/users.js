// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');

// router.post('/register', userController.register);
// router.post('/login', userController.login);
// router.get('/users', userController.getAllUsers);
// router.put('/users/:id', userController.updateUser);
// router.delete('/users/:id', userController.deleteUser);

// module.exports = router;

// routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);
router.post('/update/:id', isAuthenticated, isAdmin, userController.updateUser);
router.post('/delete/:id', isAuthenticated, isAdmin, userController.deleteUser);

module.exports = router;