# EduRate Backend

Node.js + Express API for EduRate.

## Folder structure

```text
backend/
  package.json
  .env.example
  src/
    app.js
    server.js
    config/
      db.js
    controllers/
      answerController.js
      authController.js
      courseController.js
      professorController.js
      questionController.js
      reviewController.js
    middleware/
      authMiddleware.js
      errorMiddleware.js
    models/
      Answer.js
      Course.js
      ForumCategory.js
      Professor.js
      Question.js
      Review.js
      User.js
      University.js
    routes/
      answerRoutes.js
      authRoutes.js
      courseRoutes.js
      professorRoutes.js
      questionRoutes.js
      reviewRoutes.js
    utils/
      email.js
      jwt.js
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Auth endpoints

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Registration requires a `universityId`. The email domain is checked against the selected university's `email_domains` array in PostgreSQL.

## Rate endpoints

```text
GET  /api/professors
GET  /api/professors/:id
POST /api/reviews
```

`POST /api/reviews` requires a Bearer JWT token and stores ratings for explanation, difficulty, objectivity, plus anonymous review preference.

## Q&A forum endpoints

```text
GET  /api/questions
GET  /api/questions/:id
GET  /api/courses
GET  /api/courses/:id/questions
POST /api/questions
POST /api/questions/:id/answers
PUT  /api/answers/:id/vote
```

Question, answer, and answer vote mutations require a Bearer JWT token. Answer vote `value` can be `1`, `-1`, or `0` to clear the vote.
