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
/professors/[slug] Professor profile and review form
/forum           Course Q&A forum
/forum/[slug]    Question thread with answers and votes
/resources       Course materials and upload form
/profile         Signed-in user activity overview
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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
