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
      marketplaceController.js
      professorController.js
      questionController.js
      resourceController.js
      reviewController.js
    middleware/
      authMiddleware.js
      errorMiddleware.js
      uploadMiddleware.js
    models/
      Answer.js
      Course.js
      ForumCategory.js
      MarketItem.js
      Professor.js
      Question.js
      Resource.js
      Review.js
      User.js
      University.js
    routes/
      answerRoutes.js
      authRoutes.js
      courseRoutes.js
      marketplaceRoutes.js
      professorRoutes.js
      questionRoutes.js
      resourceRoutes.js
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

## Demo seed

```bash
cd backend
npm run seed
```

The seed script clears the current database data and inserts demo content for all EduRate modules. Demo login:

```text
Email: test@karabakh.edu.az
Password: password123
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

## Resources endpoints

```text
GET  /api/resources
GET  /api/courses/:id/resources
POST /api/resources
```

`POST /api/resources` requires a Bearer JWT token and accepts multipart form data with `file`, `courseId`, `title`, optional `description`, and optional `isAnonymous`. Uploaded files are stored locally under `backend/uploads/resources/` and served from `/uploads/resources/...`.

## Marketplace endpoints

```text
GET  /api/marketplace
POST /api/marketplace
```

`GET /api/marketplace` accepts optional `category`, `search`, and `limit` query params. `POST /api/marketplace` requires a Bearer JWT token and creates a campus item from `title`, `description`, `categorySlug`, optional `price`, optional `swapNote`, `condition`, `campusLocation`, `contactMethod`, `contactValue`, and optional `imageUrl`.

Marketplace is a listing board only. It stores seller contact details through `contactMethod` (`whatsapp` or `email`) and `contactValue`; it does not create internal payments, orders, or checkout flows.
