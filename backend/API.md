# API Documentation

Base URL: http://localhost:3000/api

Authentication
- All protected endpoints require an `Authorization` header with a JWT token:

  Authorization: Bearer <token>

Login
- POST /auth/login
  - Description: Authenticate a user and return a JWT plus user info.
  - Auth: none
  - Body (application/json):
    {
      "email": "alice@example.com",
      "password": "password123"
    }
  - Response (200):
    {
      "token": "<jwt-token>",
      "user": {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "manager",
        "canCreateTasks": true,
        "canEditTasks": true,
        "canDeleteTasks": false,
        "canAssignTasks": true
      }
    }

Users
- GET /users
  - Description: Return a list of users (id, name, email, role and permission flags).
  - Auth: protected (requires JWT)
  - Query: none
  - Response (200):
    [
      {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "manager",
        "canCreateTasks": true,
        "canEditTasks": true,
        "canDeleteTasks": false,
        "canAssignTasks": true
      }
    ]

Tasks
- GET /tasks
  - Description: Fetch tasks with optional filters and pagination.
  - Auth: protected (requires JWT)
  - Query parameters:
    - page (number, default 1)
    - limit (number, default 5)
    - status (string: "Todo" | "In Progress" | "Done")
    - assignedUserId (number or "unassigned")
    - search (string; searches title and description)
  - Example request: /tasks?page=1&limit=10&status=Todo&search=report
  - Response (200):
    {
      "data": [
        {
          "id": 1,
          "title": "Write report",
          "description": "Monthly report",
          "status": "Todo",
          "assignedUserId": 3,
          "assignedUser": { "id": 3, "name": "Carol Davis" },
          "createdAt": "2026-04-17T12:34:56.000Z",
          "updatedAt": "2026-04-17T12:34:56.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 42,
        "totalPages": 5
      }
    }

- POST /tasks
  - Description: Create a new task.
  - Auth: protected (requires `canCreateTasks` permission)
  - Body (application/json):
    {
      "title": "New task",
      "description": "Optional",
      "status": "Todo",
      "assignedUserId": 2   // nullable or empty string for unassigned
    }
  - Response (201): created task object (includes `assignedUser` relation)
  - Errors: 400 for validation errors, 403 if user lacks permission

- PUT /tasks/:id
  - Description: Update an existing task.
  - Auth: protected (requires `canEditTasks` permission)
  - Body: same shape as POST /tasks (assignedUserId may be null or omitted)
  - Response (200): updated task object
  - Errors: 400 for validation, 403 if no permission, 404 if not found

- DELETE /tasks/:id
  - Description: Soft-delete a task (sets `deletedAt`).
  - Auth: protected (requires `canDeleteTasks` permission)
  - Response (200): { "message": "Task deleted" } (or 204 depending on implementation)
  - Errors: 403 if no permission, 404 if not found

Notes
- All task endpoints exclude soft-deleted records by default (filter deletedAt: null).
- Request bodies must follow validation rules: `title` is required, `status` must be one of the allowed values.

Contact / Next steps
- If you want a Postman collection or Swagger/OpenAPI spec, I can generate one from these routes.
