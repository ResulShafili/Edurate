const Course = require('../models/Course');

async function listCourses(req, res, next) {
  try {
    const courses = await Course.list({
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      limit: req.query.limit
    });

    return res.status(200).json({ courses });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCourses
};
