require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const answerRoutes = require('./routes/answerRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const professorRoutes = require('./routes/professorRoutes');
const questionRoutes = require('./routes/questionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

const corsOptions = process.env.CLIENT_URL
  ? { origin: process.env.CLIENT_URL, credentials: true }
  : {};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'edurate-api'
  });
});

app.use('/api/answers', answerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
