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

function validateCreateReviewBody(body) {
  const errors = [];
  const ratingOverall = toRating(body.ratingOverall);
  const ratingTeaching = toRating(body.ratingTeaching);
  const legacyDifficulty = toRating(body.ratingDifficulty);
  const ratingCourseBalance = toRating(body.ratingCourseBalance)
    || (legacyDifficulty ? 6 - legacyDifficulty : null);
  const ratingObjectivity = toRating(body.ratingObjectivity);

  if (!body.professorId || !uuidRegex.test(body.professorId)) {
    errors.push('Valid professorId is required');
  }

  if (!body.courseId || !uuidRegex.test(body.courseId)) {
    errors.push('Valid courseId is required');
  }

  if (!ratingOverall) {
    errors.push('ratingOverall must be between 1 and 5');
  }

  if (!ratingTeaching) {
    errors.push('ratingTeaching must be between 1 and 5');
  }

  if (!ratingCourseBalance) {
    errors.push('ratingCourseBalance must be between 1 and 5');
  }

  if (!ratingObjectivity) {
    errors.push('ratingObjectivity must be between 1 and 5');
  }

  if (body.semester && !allowedSemesters.has(body.semester)) {
    errors.push('semester must be spring, summer, fall, or winter');
  }

  if (Object.prototype.hasOwnProperty.call(body, 'comment')) {
    errors.push('Open-text comments are not accepted for professor ratings');
  }

  return {
    errors,
    values: {
      ratingOverall,
      ratingTeaching,
      ratingCourseBalance,
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

    const review = await Review.create({
      universityId: req.user.universityId,
      reviewerId: req.user.id,
      professorId: req.body.professorId,
      courseId: req.body.courseId,
      semester: req.body.semester || getDefaultSemester(),
      academicYear: Number(req.body.academicYear) || new Date().getFullYear(),
      ratingOverall: values.ratingOverall,
      ratingTeaching: values.ratingTeaching,
      ratingCourseBalance: values.ratingCourseBalance,
      ratingObjectivity: values.ratingObjectivity,
      wouldTakeAgain: values.ratingOverall >= 4,
      isAnonymous: req.body.isAnonymous !== false
    });

    return res.status(201).json({
      message: 'Structured rating created successfully',
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
