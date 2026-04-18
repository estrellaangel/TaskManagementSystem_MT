# Task Management System

This repository contains a full-stack Task Management demo application (frontend + backend) built with React, Node/Express, and Prisma (SQLite by default). It demonstrates user authentication (JWT), task CRUD with soft-delete, filtering, pagination, and role-based permissions.

This README provides quick setup steps, environment variables, and an architecture overview to help you run the project locally and understand the code layout.

## Contents
- `backend/` - Express API server, Prisma models, controllers, services, and seed script
- `frontend/` - React (Vite) single-page app

## Requirements
- Node.js (v16+ recommended)

## Environment variables
Create a `.env` file in `backend/` (or set environment variables) with at least the following values:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="change_this_to_a_secure_secret"
PORT=3000
```

Notes:
- `DATABASE_URL` can point to a file-based SQLite DB (default above) or another DB supported by Prisma.
- `JWT_SECRET` is required for signing tokens returned from `/api/auth/login`.

## Backend setup (run from repository root)

Install dependencies:

```bash
cd backend
npm install
```

Run migrations (creates or updates the SQLite DB) and seed data:

```bash
# create and apply prisma migrations (development)
npx prisma migrate dev --name init

# or if you prefer to seed directly
node prisma/seed.js
```

Start the backend server:

```bash
npm run dev
# (or `node src/server.js` depending on your scripts)
```

The backend listens on `http://localhost:3000` by default and exposes API under `/api`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser (Vite typically serves at `http://localhost:5173`).

## Default seeded credentials
The seed script creates several users with the plaintext password `password123`. Use one of the seeded emails for login, for example:

- alice@example.com (manager)
- bob@example.com (manager)
- carol@example.com (contributor)
- diana@example.com (admin)

When you login via the frontend, it calls `POST /api/auth/login` and stores the returned JWT in localStorage for subsequent requests.

## Architecture / Where to find code

- Backend
  - `backend/src/controllers/` - Request handlers (auth, tasks, users)
  - `backend/src/services/` - Business logic called by controllers (some logic may be in controllers as well)
  - `backend/src/lib/prisma.js` - Prisma client wrapper
  - `backend/prisma/schema.prisma` - Database schema
  - `backend/prisma/seed.js` - Seed data script
  - `backend/src/middleware/` - Auth and error middleware

- Frontend
  - `frontend/src/pages/` - Page components (`LoginPage.jsx`, `TaskPage.jsx`)
  - `frontend/src/components/` - Reusable UI components (TaskList, TaskRow, TaskFormModal, FilterBar)
  - `frontend/src/services/api.js` - Axios instance that attaches the JWT

## API Documentation
See `backend/API.md` for a concise list of endpoints, example requests/responses, and required auth headers.

## Notes & Next steps
- Add a `.env.example` file with recommended values (handy for deployments).
- Optionally generate an OpenAPI/Swagger spec or Postman collection from `backend/` routes (I can help with that).
- The code includes basic validation, permission checks, and a soft-delete approach for tasks.

If you'd like, I can also generate a Postman collection or add a small API reference page (Swagger UI) mounted on the backend.
