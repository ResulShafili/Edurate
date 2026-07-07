const express = require('express');

const answerController = require('../controllers/answerController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/:id/vote', requireAuth, answerController.voteAnswer);

module.exports = router;
