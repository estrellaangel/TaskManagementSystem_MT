# Task Management System

This project was built to satisfy the Full Stack Software Engineer Exercise requirements across the frontend, backend, database, and documentation layers. Below is a direct breakdown of how each requirement is addressed.

### Frontend Requirements

**1. Login screen (mock authentication allowed)**  
Implemented through a dedicated login page that authenticates users against the backend and stores a JWT for subsequent requests.

**2. Task list view with pagination**  
The task page displays tasks in a paginated list so users can navigate through larger datasets in a manageable way.

**3. Create and edit task form**  
Tasks can be created and edited through a reusable modal form component that supports both modes.

**4. Filter tasks by status and assigned user**  
The interface includes filtering controls for task status and assigned user, along with task search functionality for faster navigation.

**5. Responsive UI (desktop and mobile)**  
The frontend uses responsive layouts so the task list, filters, and forms adapt cleanly to smaller screen sizes.

**6. Form validation and error handling**  
The task form validates required fields such as title and displays user-facing error messages when validation fails or a request cannot be completed.

**7. Loading indicators for async actions**  
Async actions such as task saving include a loading state and visual overlay/spinner behavior to give clear feedback to the user.

### Backend Requirements

**1. REST APIs for creating, updating, deleting tasks**  
The backend exposes REST endpoints for task creation, updates, and deletion-related workflows.

**2. Assign tasks to users**  
Tasks support assignment to users through the backend data model and API update logic.

**3. Fetch tasks with filter and pagination support**  
Task retrieval endpoints support filtering and pagination so the frontend can efficiently query and display subsets of tasks.

**4. Authentication endpoint (JWT or mock token)**  
Authentication is implemented with a login endpoint that returns a JWT used by the frontend for protected requests.

**5. Proper input validation and HTTP status codes**  
The backend performs validation and returns appropriate HTTP status codes for success, invalid input, unauthorized access, and other error conditions.

**6. Clear separation between controller, service, and data layers**  
The backend is structured into controllers, services, middleware, and Prisma-based data access for readability and maintainability.

### Database Requirements

**1. User and Task entities with relationships**  
The database schema includes `User` and `Task` entities, with tasks linked to users through relational fields.

**2. Support task statuses (Todo, In Progress, Done)**  
The system supports the required task statuses throughout both the frontend and backend flows.

**3. Normalized schema with foreign keys**  
The schema uses relational design principles and foreign key relationships to keep task and user data structured and normalized.

**4. Indexes on frequently queried fields**  
The schema is designed to support efficient querying on commonly used task fields such as status, assignment, and non-deleted records where applicable.

**5. Soft delete preferred**  
Tasks use a soft-delete approach so records can be hidden from active views without being permanently removed from the database.

**6. Seed/sample data scripts**  
A Prisma seed script is included to populate the database with sample users and tasks for testing.

### Non-Functional Requirements

**1. Readable, maintainable code**  
The project is organized into clear frontend and backend directories with reusable components and separated backend layers.

**2. Basic security best practices**  
JWT authentication, protected API requests, permission checks, and restricted UI actions are included as foundational security measures.

**3. Error handling and logging**  
The application includes frontend form errors, backend error handling middleware, and structured request handling for easier debugging and maintenance.

**4. Clear documentation**  
This README and the API documentation provide setup guidance, architecture explanation, and endpoint references.

### Submission Requirements

**1. Source code repository with frontend, backend, and database**  
The repository includes a complete frontend, backend, Prisma schema, and seed data.

**2. README with setup steps and architecture explanation**  
This README provides setup instructions, project structure, workflows, and architecture details.

**3. API documentation (Swagger/Postman/Markdown)**  
API documentation is included in Markdown format under `backend/API.md`.

---

## Additional Enhancement: Role and Permission Logic

In addition to the core exercise requirements, this project includes expanded role- and permission-aware behavior to better simulate a real-world task management system.

Rather than treating all authenticated users the same, the application supports role-sensitive workflows such as:
- restricting which users can create, edit, or assign tasks
- conditionally showing or hiding UI actions based on permissions
- limiting assignment options to valid user roles
- enforcing permissions in both the frontend and backend

This extra layer of authorization improves realism, strengthens security, and demonstrates how business rules can be reflected consistently across the full stack.
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
To see swagger go to `http://localhost:3000/api/docs/`

## Frontend setup (run from repository root)

In a new terminal complete these bash commands.

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser should display in your terminal (Vite typically serves at `http://localhost:5174`).

## Default seeded credentials
The seed script creates several users with the plaintext password `password123`. Use one of the seeded emails for login, for example:

- alice@example.com (manager)
- bob@example.com (manager)
- carol@example.com (contributor)
- diana@example.com (admin)

When you login via the frontend, it calls `POST /api/auth/login` and stores the returned JWT in localStorage for subsequent requests.

## Quick Test
1. Log in with sample account
2. See task page
3. Create a task
4. Edit a task and assign a user
5. Filter tasks by assigned user
6. Open Manage Users and verify permissions page loads

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

## Permission Model Overview
The system uses both frontend permission handling and backend authorization enforcement.

Frontend permission handling:

The UI checks values such as:
- canCreateTasks
- canEditTasks
- canAssignTasks

These values determine:
- whether buttons appear
- whether forms are enabled
- whether assignment controls are visible
- whether a user can submit a modal form

Backend enforcement: 

Even if someone manipulates the frontend, the backend still validates whether the action is allowed before processing it. This ensures the permission model is not purely cosmetic.

## API Documentation
See `backend/API.md` for a concise list of endpoints, example requests/responses, and required auth headers.

## Notes & Next steps
- Add a `.env.example` file with recommended values
- expanding audit/history tracking for task changes
- adding sorting controls alongside filtering
- adding automated tests for auth, permissions, and filtering workflows

# # Main User Workflows
1. Login Workflow
- User enters email and password on the login page
- Frontend sends credentials to POST /api/auth/login
- Backend validates the user and returns a JWT
- Frontend stores the token in localStorage
- Authenticated requests automatically include the token through the API service layer

2. Task Viewing Workflow
- User logs in and opens the task page
- Frontend requests task data from the backend
- Tasks are displayed in a paginated list
- The visible actions depend on the user’s permissions

3. Filtering Workflow
- User opens the filter panel
- User filters by status, assigned user, or search text
- The task list updates to reflect the selected filters
- Multiple filters can work together to narrow the results

4. Task Creation Workflow
- A user with create permission opens the task modal
- The user enters task details
- The frontend performs basic validation
- The backend validates permissions and saves the task
- The task list refreshes with the new entry

5. Task Editing Workflow
- A user with edit permission opens the edit modal
- Existing task data is loaded into the form
- The user updates fields such as title, description, status, or assignment
- The frontend submits the changes
- The backend enforces permissions and persists the update

6. Assignment Workflow
- Users with assignment permission can assign a task to a manager or contributor
- The assignable user list is filtered on the frontend
- The backend stores the selected assignee
- Unassignment is also supported by submitting an empty value

7. Soft Delete Workflow
- A user with delete access deletes a task
- The task is marked as deleted rather than permanently removed
- This preserves database history while removing the task from normal views