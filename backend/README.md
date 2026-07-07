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
      authController.js
    middleware/
      authMiddleware.js
      errorMiddleware.js
    models/
      User.js
      University.js
    routes/
      authRoutes.js
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
