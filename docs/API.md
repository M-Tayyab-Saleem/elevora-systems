# API Overview

The Elevora Systems backend is a Node.js/Express REST API. It serves the frontend client and manages communication with the MongoDB database.

## Base URL
All API requests are prefixed with `/api` (e.g., `http://localhost:3000/api`).

## Authentication
Most routes require authentication via a JWT Bearer token.
Include the token in the `Authorization` header of your requests:
```http
Authorization: Bearer <your_jwt_token>
```

## Standard Response Format
A successful API response generally follows this structure:
```json
{
  "status": "success",
  "data": {
    "user": { ... }
  }
}
```

Errors follow this structure:
```json
{
  "status": "error",
  "message": "Invalid credentials",
  "stack": "..." // Only present in development environments
}
```

## Key Endpoints

### Authentication (`/api/auth`)
- `POST /login`: Authenticate a user and receive a JWT.
- `POST /register`: Register a new employee (Super Admin / HR only).
- `GET /me`: Retrieve the currently authenticated user's profile.

### People (`/api/users`)
- `GET /`: List all employees (supports filtering and pagination).
- `GET /:id`: Retrieve a specific employee profile.
- `PATCH /:id`: Update an employee profile.

### Attendance (`/api/attendance`)
- `POST /clock-in`: Record a user's clock-in time.
- `POST /clock-out`: Record a user's clock-out time.
- `GET /my-records`: View personal attendance history.

### Projects & Tickets (`/api/projects`, `/api/tickets`)
- `GET /projects`: List all active projects.
- `POST /projects`: Create a new project workspace.
- `GET /tickets`: List tickets (filterable by assignee, status, project).
- `PATCH /tickets/:id/status`: Update the Kanban status of a ticket.

### Demo Mode Overrides
When `DEMO_MODE=true` is enabled in the backend `.env`, the authentication middleware is bypassed for specific demo routes to allow seamless access without credentials. This is strictly intended for portfolio showcase environments.
