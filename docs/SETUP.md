# Setup Guide

Follow these steps to run the Elevora Systems application locally on your machine.

## Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **MongoDB**: A running local instance (port 27017) or a MongoDB Atlas connection string.

## 1. Clone the Repository
```bash
git clone https://github.com/M-Tayyab-Saleem/elevora-systems.git 
cd elevora-systems
```

## 2. Backend Setup
The backend requires environment variables to connect to the database and third-party services.

```bash
cd backend
npm install
```

Copy the example environment file and configure it:
```bash
cp ../.env.example .env
```
*Note: Make sure to update the `MONGODB_URI` and `JWT_SECRET` in your `.env` file.*

Seed the database with dummy data (highly recommended for local development):
```bash
npm run seed
```

Start the backend server:
```bash
npm start
```
The server will start on `http://localhost:3000`.

## 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory.

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## 4. Accessing the Application
Navigate to `http://localhost:5173` in your browser. 
If `DEMO_MODE=true` is set in your backend `.env` file, you can simply select a role on the login page to gain immediate access without credentials.
