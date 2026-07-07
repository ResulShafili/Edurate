# EduRate Frontend

Next.js + Tailwind CSS frontend for EduRate.

## Stack

```text
Next.js App Router
React
Tailwind CSS
Lucide React
```

## Routes

```text
/          Main compact dashboard layout
/login     Auth login page
/register  Auth register page
/professors      Professor and course search
/professors/[id] Professor profile and review form
/forum           Course Q&A forum
/questions/[id]  Question thread with answers and votes
```

## Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend expects the backend API URL in:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000
```
