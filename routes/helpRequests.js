const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/:id/accept', isAuthenticated, helpRequestController.acceptHelpRequest);
router.post('/:id/reject', isAuthenticated, helpRequestController.rejectHelpRequest);

module.exports = router;