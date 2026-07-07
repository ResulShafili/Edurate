const fs = require('fs');
const path = require('path');

const Course = require('../models/Course');
const Resource = require('../models/Resource');
const { getResourceFileType } = require('../middleware/uploadMiddleware');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedFileTypes = new Set(['pdf', 'image']);

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isUuid(value) {
  return typeof value === 'string' && uuidRegex.test(value);
}

function removeUploadedFile(file) {
  if (file?.path) {
    fs.unlink(file.path, () => {});
  }
}

async function listResources(req, res, next) {
  try {
    const courseId = req.params.id || req.query.courseId;

    if (courseId && !isUuid(String(courseId))) {
      return res.status(400).json({
        message: 'Valid course id is required'
      });
    }

    const fileType = req.query.fileType ? String(req.query.fileType) : 'all';

    if (fileType !== 'all' && !allowedFileTypes.has(fileType)) {
      return res.status(400).json({
        message: 'fileType must be pdf, image, or all'
      });
    }

    const resources = await Resource.list({
      courseId: courseId ? String(courseId) : null,
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      fileType,
      search: cleanText(req.query.search),
      limit: req.query.limit
    });

    return res.status(200).json({ resources });
  } catch (error) {
    return next(error);
  }
}

async function createResource(req, res, next) {
  try {
    const courseId = cleanText(req.body.courseId);
    const title = cleanText(req.body.title);
    const description = cleanText(req.body.description);
    const errors = [];

    if (!req.file) {
      errors.push('resource file is required');
    }

    if (!isUuid(courseId)) {
      errors.push('Valid courseId is required');
    }

    if (title.length < 3 || title.length > 160) {
      errors.push('title must be between 3 and 160 characters');
    }

    if (description.length > 600) {
      errors.push('description must be 600 characters or less');
    }

    const fileType = req.file ? getResourceFileType(req.file.mimetype) : null;

    if (req.file && !fileType) {
      errors.push('Only PDF, PNG, JPG, and WEBP files are allowed');
    }

    if (errors.length > 0) {
      removeUploadedFile(req.file);
      return res.status(400).json({ errors });
    }

    const course = await Course.findById(courseId);

    if (!course || course.universityId !== req.user.universityId) {
      removeUploadedFile(req.file);
      return res.status(400).json({
        message: 'Selected course does not belong to your university'
      });
    }

    const storageKey = `resources/${req.file.filename}`;
    const fileUrl = `/uploads/${storageKey}`;
    const resource = await Resource.create({
      universityId: req.user.universityId,
      uploaderId: req.user.id,
      courseId,
      title,
      description,
      fileName: req.file.originalname || path.basename(req.file.filename),
      fileType,
      fileUrl,
      storageKey,
      fileSizeBytes: req.file.size,
      isAnonymous: req.body.isAnonymous !== 'false'
    });

    return res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    removeUploadedFile(req.file);
    return next(error);
  }
}

module.exports = {
  createResource,
  listResources
};
