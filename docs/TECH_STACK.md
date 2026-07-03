# Tech Stack

The Elevora Systems application utilizes a modern, robust Javascript stack.

## Frontend
*   **React 19:** The core UI library, utilizing the latest functional components and hooks.
*   **Vite:** A blazing fast build tool and development server, significantly improving developer experience over Webpack.
*   **Tailwind CSS:** A utility-first CSS framework for rapid, maintainable styling.
*   **Redux Toolkit & React-Redux:** Predictable state management for complex application data.
*   **Redux Persist:** Persists the Redux store to local storage to maintain user sessions.
*   **React Router DOM v7:** Handles client-side routing.
*   **Framer Motion:** Powers the smooth, performant micro-interactions and scroll reveals on the landing page.
*   **Lucide React:** A clean, modern SVG icon library.
*   **Chart.js & React-Chartjs-2:** Renders interactive data visualizations and analytics dashboards.

## Backend
*   **Node.js:** The JavaScript runtime environment.
*   **Express.js:** A fast, unopinionated web framework for building the REST API.
*   **MongoDB & Mongoose:** A NoSQL database and Object Data Modeling (ODM) library for flexible, schema-based data management.
*   **JSON Web Tokens (JWT):** Secure, stateless authentication.
*   **Bcrypt.js:** Hashes user passwords before storing them in the database.
*   **Multer:** Middleware for handling `multipart/form-data`, primarily used for uploading files.

## Third-Party Services
*   **Cloudinary:** A cloud-based image and video management service used to store user avatars and receipt uploads securely.
*   **Brevo (formerly Sendinblue):** An SMTP relay service utilized via Nodemailer to send transactional system emails.
