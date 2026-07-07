const express = require('express');

const courseController = require('../controllers/courseController');
const questionController = require('../controllers/questionController');

const router = express.Router();

router.get('/', courseController.listCourses);
router.get('/:id/questions', questionController.listCourseQuestions);

module.exports = router;
