const express = require('express');

const questionController = require('../controllers/questionController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', questionController.listQuestions);
router.post('/', requireAuth, questionController.createQuestion);
router.get('/:id', questionController.getQuestion);
router.post('/:id/answers', requireAuth, questionController.createAnswer);

module.exports = router;
