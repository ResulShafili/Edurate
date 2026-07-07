const express = require('express');

const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, reviewController.createReview);

module.exports = router;
