# Elevora Systems - Enterprise HRMS & Management Platform

![Elevora Banner](https://placehold.co/1200x400/1e293b/ffffff?text=Elevora+Systems+HRMS)

Elevora is a comprehensive Human Resource Management System (HRMS) designed to streamline enterprise workflows. It provides a centralized hub for managing employees, attendance, projects, expenses, support tickets, and role-based access control.

> **Note**: This is a portfolio demonstration project. All data, user accounts, and company names are purely fictional. 

[**Live Demo**](#) *(Coming Soon)*

## 🚀 Key Features

* **Advanced Role-Based Access Control (RBAC):** Tailored permissions for Super Admins, Managers, HR, and Employees.
* **Employee Management & Directory:** Complete lifecycle tracking, org charts, and documentation storage.
* **Attendance & Time Tracking:** Automated check-in/out workflows, timesheets, and absentee tracking.
* **Project & Task Management:** Kanban boards, task assignment, and progress visualization.
* **Expense Management:** Submit, review, and approve corporate expenses with receipt processing capabilities.
* **Support Ticket System:** Centralized internal IT and HR helpdesk ticketing.
* **Real-time Notifications:** WebSockets/SSE for instant updates across the organization.

## 💻 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS, Material Tailwind
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v7
- **Charts:** Chart.js, React-Chartjs-2
- **Icons:** HeroIcons, Lucide React

### Backend
- **Runtime:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, Role-Based Access Control
- **Storage:** Cloudinary / Multer
- **Email:** Nodemailer (Brevo Integration)

## 🏗 Architecture Overview

The system is built on a modern MERN stack with a decoupled frontend and backend. 
- The frontend is a Single Page Application (SPA) optimized with Vite, utilizing React Context and Redux for complex state synchronization. 
- The backend operates as a RESTful API, featuring custom middleware for error handling, JWT verification, and an interactive "Demo Mode" interceptor that allows recruiters to explore functionality without risking destructive data changes.

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for storage)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/elevora-systems.git
cd elevora-systems
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
DEMO_MODE=true
```
Run the seed script to populate demo data, then start the server:
```bash
npm run seed
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

## 🔒 Authentication Flow (Demo Mode)

For portfolio review purposes, this application features a friction-less login system. 
1. Navigate to the login page.
2. Select one of the pre-configured roles (e.g., Super Admin, HR, Manager).
3. The system bypasses standard 2FA/SSO and injects a complete mock user profile, allowing full exploration of the interface.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author
**Your Name**
- GitHub: [@M-Tayyab-Saleem](https://github.com/M-Tayyab-Saleem)
- LinkedIn: [M Tayyab Saleem](https://www.linkedin.com/in/mtayyab-saleem/)
