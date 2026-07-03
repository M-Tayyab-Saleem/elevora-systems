# Deployment Guide

The Elevora Systems application is designed to be easily deployed to modern cloud hosting providers.

## Recommended Providers
- **Frontend:** Vercel or Netlify
- **Backend:** Render, Heroku, or AWS Elastic Beanstalk
- **Database:** MongoDB Atlas

## Frontend Deployment (Vercel)

Vercel provides the easiest deployment path for Vite/React applications.

1. Connect your GitHub repository to Vercel.
2. Configure the Build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add any necessary Environment Variables (e.g., `VITE_API_URL` pointing to your deployed backend).
4. Deploy.

## Backend Deployment (Render)

Render is an excellent platform for Node.js backends.

1. Connect your GitHub repository to Render.
2. Create a new "Web Service".
3. Configure the Build settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Configure Environment Variables:
   - Provide your `MONGODB_URI` from MongoDB Atlas.
   - Set your `JWT_SECRET`.
   - Configure Cloudinary variables (`CLOUDINARY_URL`, etc.).
   - Set `DEMO_MODE=false` if this is a production environment.
5. Deploy.

## Post-Deployment Checks
- Ensure CORS in the backend `index.js` allows requests from your deployed frontend domain.
- Verify that the database connection string is properly allowing IP access from your hosting provider.
