const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/create/:reservationId', isAuthenticated, reviewController.createReviewForm);
router.post('/create', isAuthenticated, reviewController.createReview);
router.get('/volunteer/:volunteerId', reviewController.getVolunteerReviews);

module.exports = router;