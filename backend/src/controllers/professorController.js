const Professor = require('../models/Professor');
const Review = require('../models/Review');

async function listProfessors(req, res, next) {
  try {
    const professors = await Professor.list({
      search: req.query.search ? String(req.query.search).trim() : '',
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      limit: req.query.limit
    });

    return res.status(200).json({ professors });
  } catch (error) {
    return next(error);
  }
}

async function getProfessor(req, res, next) {
  try {
    const professor = await Professor.findById(req.params.id);

    if (!professor) {
      return res.status(404).json({
        message: 'Professor not found'
      });
    }

    const reviews = await Review.listByProfessor(req.params.id);

    return res.status(200).json({
      professor: {
        ...professor,
        reviews
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfessor,
  listProfessors
};
