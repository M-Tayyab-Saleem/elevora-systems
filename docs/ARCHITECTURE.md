# Architecture

The Elevora Systems application utilizes a decoupled MERN stack (MongoDB, Express.js, React, Node.js). 

## High-Level Architecture

```
[ Client / Browser ]
        |
        | (HTTPS / REST)
        v
[ Express.js Backend API ]
        |
        | (Mongoose)
        v
[ MongoDB Database ]
```

## Frontend (React + Vite)
The frontend is a Single Page Application (SPA) designed for speed and modularity.
- **Build Tool:** Vite is used over Webpack for significantly faster HMR and optimized production builds.
- **State Management:** Redux Toolkit manages the global state (user sessions, application settings), heavily utilizing `redux-persist` to maintain state across reloads.
- **Styling:** Tailwind CSS provides utility-first styling, enabling rapid UI development. Framer Motion is utilized for complex, performant animations.

## Backend (Node.js + Express)
The backend is a robust RESTful API that handles business logic, database transactions, and authentication.
- **Routing:** API routes are modularized by feature (e.g., `/api/users`, `/api/attendance`).
- **Middleware:** Custom middleware handles JWT verification, Role-Based Access Control (RBAC), error handling, and request logging.
- **Database Schema:** Mongoose schemas enforce data integrity, utilizing references (`ref`) to create complex relationships between Collections (e.g., Users referencing Departments).

## Third-Party Integrations
- **Cloudinary:** Used for robust, external image and document storage to keep the database lightweight.
- **Brevo (Nodemailer):** Configured as the SMTP relay for sending automated system emails (e.g., password resets, welcome emails).

## Demo Mode Interceptor
For portfolio demonstration purposes, the system includes a `DEMO_MODE` flag. When enabled, a specialized middleware intercepts authentication requests, allowing users to select a role (Admin, HR, Employee) and instantly log in without requiring external OAuth or 2FA systems, facilitating a frictionless review experience.
