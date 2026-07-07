const bcrypt = require('bcryptjs');

const University = require('../models/University');
const User = require('../models/User');
const {
  getEmailDomain,
  isUniversityEmail,
  isValidEmailFormat,
  normalizeEmail
} = require('../utils/email');
const { signAccessToken } = require('../utils/jwt');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateRegisterBody(body) {
  const errors = [];

  if (body.universityId && !uuidRegex.test(body.universityId)) {
    errors.push('Valid universityId is required');
  }

  if (!isValidEmailFormat(body.email)) {
    errors.push('Valid email is required');
  }

  if (!body.fullName || String(body.fullName).trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!body.password || String(body.password).length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return errors;
}

async function resolveUniversityForRegistration(body, email) {
  if (body.universityId) {
    return University.findById(body.universityId);
  }

  const domain = body.universityDomain || getEmailDomain(email);

  if (!domain) {
    return null;
  }

  return University.findByEmailDomain(domain);
}

function validateLoginBody(body) {
  const errors = [];

  if (!isValidEmailFormat(body.email)) {
    errors.push('Valid email is required');
  }

  if (!body.password) {
    errors.push('Password is required');
  }

  return errors;
}

async function register(req, res, next) {
  try {
    const validationErrors = validateRegisterBody(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const email = normalizeEmail(req.body.email);
    const university = await resolveUniversityForRegistration(req.body, email);

    if (!university) {
      return res.status(404).json({
        message: 'University not found'
      });
    }

    if (!isUniversityEmail(email, university.emailDomains)) {
      return res.status(400).json({
        message: 'Please use your official university email address'
      });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      universityId: university.id,
      email,
      passwordHash,
      fullName: String(req.body.fullName).trim(),
      username: req.body.username ? String(req.body.username).trim() : null
    });
    const token = signAccessToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Email or username already exists'
      });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const validationErrors = validateLoginBody(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const email = normalizeEmail(req.body.email);
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const publicUser = User.toPublicUser(user);
    const token = signAccessToken(publicUser);

    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: publicUser
    });
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.status(200).json({
    user: req.user
  });
}

module.exports = {
  login,
  me,
  register
};
