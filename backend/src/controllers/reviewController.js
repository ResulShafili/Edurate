const Course = require('../models/Course');
const Review = require('../models/Review');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedSemesters = new Set(['spring', 'summer', 'fall', 'winter']);

function toRating(value) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

function getDefaultSemester() {
  const month = new Date().getMonth() + 1;

  if (month >= 9 && month <= 12) {
    return 'fall';
  }

  if (month >= 6 && month <= 8) {
    return 'summer';
  }

  return 'spring';
}

function calculateOverall({ ratingTeaching, ratingDifficulty, ratingObjectivity }) {
  const difficultyAdjusted = 6 - ratingDifficulty;
  return Math.round((ratingTeaching + ratingObjectivity + difficultyAdjusted) / 3);
}

function validateCreateReviewBody(body) {
  const errors = [];
  const ratingTeaching = toRating(body.ratingTeaching);
  const ratingDifficulty = toRating(body.ratingDifficulty);
  const ratingObjectivity = toRating(body.ratingObjectivity);

  if (!body.professorId || !uuidRegex.test(body.professorId)) {
    errors.push('Valid professorId is required');
  }

  if (!body.courseId || !uuidRegex.test(body.courseId)) {
    errors.push('Valid courseId is required');
  }

  if (!ratingTeaching) {
    errors.push('ratingTeaching must be between 1 and 5');
  }

  if (!ratingDifficulty) {
    errors.push('ratingDifficulty must be between 1 and 5');
  }

  if (!ratingObjectivity) {
    errors.push('ratingObjectivity must be between 1 and 5');
  }

  if (body.semester && !allowedSemesters.has(body.semester)) {
    errors.push('semester must be spring, summer, fall, or winter');
  }

  if (body.comment && String(body.comment).trim().length > 1600) {
    errors.push('comment must be 1600 characters or less');
  }

  return {
    errors,
    values: {
      ratingTeaching,
      ratingDifficulty,
      ratingObjectivity
    }
  };
}

async function createReview(req, res, next) {
  try {
    const { errors, values } = validateCreateReviewBody(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const professorTeachesCourse = await Course.professorTeachesCourse({
      professorId: req.body.professorId,
      courseId: req.body.courseId,
      universityId: req.user.universityId
    });

    if (!professorTeachesCourse) {
      return res.status(400).json({
        message: 'Selected course does not belong to this professor'
      });
    }

    const ratingOverall = calculateOverall(values);
    const review = await Review.create({
      universityId: req.user.universityId,
      reviewerId: req.user.id,
      professorId: req.body.professorId,
      courseId: req.body.courseId,
      semester: req.body.semester || getDefaultSemester(),
      academicYear: Number(req.body.academicYear) || new Date().getFullYear(),
      ratingOverall,
      ratingTeaching: values.ratingTeaching,
      ratingDifficulty: values.ratingDifficulty,
      ratingObjectivity: values.ratingObjectivity,
      wouldTakeAgain: typeof req.body.wouldTakeAgain === 'boolean'
        ? req.body.wouldTakeAgain
        : null,
      comment: req.body.comment ? String(req.body.comment).trim() : null,
      isAnonymous: req.body.isAnonymous !== false
    });

    return res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'You have already reviewed this professor for this course and term'
      });
    }

    return next(error);
  }
}

module.exports = {
  createReview
};
