const Professor = require('../models/Professor');
const Review = require('../models/Review');
const { toSlug } = require('../utils/slug');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function withSlug(professor) {
  return {
    ...professor,
    slug: toSlug(professor.fullName)
  };
}

async function listProfessors(req, res, next) {
  try {
    const professors = await Professor.list({
      search: req.query.search ? String(req.query.search).trim() : '',
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      limit: req.query.limit
    });

    return res.status(200).json({ professors: professors.map(withSlug) });
  } catch (error) {
    return next(error);
  }
}

async function getProfessor(req, res, next) {
  try {
    const identifier = String(req.params.id || '').trim().toLowerCase();
    let professor = null;

    if (uuidRegex.test(identifier)) {
      professor = await Professor.findById(identifier);
    } else {
      const candidates = await Professor.list({ limit: 60 });
      const match = candidates.find((candidate) => toSlug(candidate.fullName) === identifier);

      if (match) {
        professor = await Professor.findById(match.id);
      }
    }

    if (!professor) {
      return res.status(404).json({
        message: 'Professor not found'
      });
    }

    const reviews = await Review.listByProfessor(professor.id);

    return res.status(200).json({
      professor: {
        ...withSlug(professor),
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
