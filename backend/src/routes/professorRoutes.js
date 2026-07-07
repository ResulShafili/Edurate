const express = require('express');

const professorController = require('../controllers/professorController');

const router = express.Router();

router.get('/', professorController.listProfessors);
router.get('/:id', professorController.getProfessor);

module.exports = router;
