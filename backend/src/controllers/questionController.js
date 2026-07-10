const Answer = require('../models/Answer');
const Course = require('../models/Course');
const ForumCategory = require('../models/ForumCategory');
const Question = require('../models/Question');
const { toSlug } = require('../utils/slug');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && uuidRegex.test(value);
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLimit(value) {
  return Math.min(Number(value) || 40, 100);
}

function withSlug(question) {
  return {
    ...question,
    slug: toSlug(question.title)
  };
}

async function listQuestions(req, res, next) {
  try {
    const courseId = req.query.courseId ? String(req.query.courseId) : null;

    if (courseId && !isUuid(courseId)) {
      return res.status(400).json({
        message: 'Valid courseId is required'
      });
    }

    const questions = await Question.list({
      courseId,
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      search: cleanText(req.query.search),
      limit: normalizeLimit(req.query.limit)
    });

    return res.status(200).json({ questions: questions.map(withSlug) });
  } catch (error) {
    return next(error);
  }
}

async function listCourseQuestions(req, res, next) {
  try {
    if (!isUuid(req.params.id)) {
      return res.status(400).json({
        message: 'Valid course id is required'
      });
    }

    const questions = await Question.list({
      courseId: req.params.id,
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      search: cleanText(req.query.search),
      limit: normalizeLimit(req.query.limit)
    });

    return res.status(200).json({ questions: questions.map(withSlug) });
  } catch (error) {
    return next(error);
  }
}

async function getQuestion(req, res, next) {
  try {
    const identifier = String(req.params.id || '').trim().toLowerCase();
    let question = null;

    if (isUuid(identifier)) {
      question = await Question.findById(identifier);
    } else {
      const candidates = await Question.list({ limit: 100 });
      question = candidates.find((candidate) => toSlug(candidate.title) === identifier) || null;
    }

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    const answers = await Answer.listByQuestion(question.id);

    return res.status(200).json({
      question: {
        ...withSlug(question),
        answers
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function createQuestion(req, res, next) {
  try {
    const title = cleanText(req.body.title);
    const body = cleanText(req.body.body);
    const courseId = req.body.courseId ? String(req.body.courseId) : '';
    const categoryId = req.body.categoryId ? String(req.body.categoryId) : '';
    const errors = [];

    if (title.length < 8 || title.length > 180) {
      errors.push('title must be between 8 and 180 characters');
    }

    if (body.length < 12 || body.length > 4000) {
      errors.push('body must be between 12 and 4000 characters');
    }

    if (!isUuid(courseId)) {
      errors.push('Valid courseId is required');
    }

    if (categoryId && !isUuid(categoryId)) {
      errors.push('categoryId must be a valid UUID');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const course = await Course.findById(courseId);

    if (!course || course.universityId !== req.user.universityId) {
      return res.status(400).json({
        message: 'Selected course does not belong to your university'
      });
    }

    const category = categoryId
      ? await ForumCategory.findById({ categoryId, universityId: req.user.universityId })
      : await ForumCategory.findOrCreateDefault(req.user.universityId);

    if (!category) {
      return res.status(400).json({
        message: 'Selected forum category does not belong to your university'
      });
    }

    const question = await Question.create({
      universityId: req.user.universityId,
      authorId: req.user.id,
      categoryId: category.id,
      courseId,
      title,
      body
    });

    return res.status(201).json({
      message: 'Question created successfully',
      question: withSlug(question)
    });
  } catch (error) {
    return next(error);
  }
}

async function createAnswer(req, res, next) {
  try {
    if (!isUuid(req.params.id)) {
      return res.status(400).json({
        message: 'Valid question id is required'
      });
    }

    const body = cleanText(req.body.body);
    const parentAnswerId = req.body.parentAnswerId ? String(req.body.parentAnswerId) : null;
    const errors = [];

    if (body.length < 2 || body.length > 3000) {
      errors.push('body must be between 2 and 3000 characters');
    }

    if (parentAnswerId && !isUuid(parentAnswerId)) {
      errors.push('parentAnswerId must be a valid UUID');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    if (question.universityId !== req.user.universityId) {
      return res.status(403).json({
        message: 'You can only answer questions from your university'
      });
    }

    if (parentAnswerId) {
      const parentAnswer = await Answer.findById(parentAnswerId);

      if (
        !parentAnswer ||
        parentAnswer.questionId !== question.id ||
        parentAnswer.universityId !== req.user.universityId
      ) {
        return res.status(400).json({
          message: 'Parent answer does not belong to this question'
        });
      }
    }

    const answer = await Answer.create({
      universityId: req.user.universityId,
      questionId: question.id,
      parentAnswerId,
      authorId: req.user.id,
      body
    });

    return res.status(201).json({
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAnswer,
  createQuestion,
  getQuestion,
  listCourseQuestions,
  listQuestions
};
