const express = require('express');

const courseController = require('../controllers/courseController');
const questionController = require('../controllers/questionController');
const resourceController = require('../controllers/resourceController');

const router = express.Router();

router.get('/', courseController.listCourses);
router.get('/:id/questions', questionController.listCourseQuestions);
router.get('/:id/resources', resourceController.listResources);

module.exports = router;
