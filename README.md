# CampusOne

CampusOne is a role-based campus complaint management platform built with the MERN stack.

It provides a centralized system where students can submit and track complaints, faculty members can manage assigned complaints, and administrators can monitor, assign, update, and archive complaints.

## Features

### Student

* Register and log in securely
* Submit campus complaints
* Add complaint category and priority
* Upload complaint images
* View complaint details and status
* Edit complaints
* Delete complaints
* Track complaint history
* Add comments to complaints
* Receive notifications
* Search and filter complaints
* Reset forgotten password

### Faculty

* View assigned complaints
* Search complaints
* Filter by status, priority, and category
* Update complaint status
* View complaint details
* Monitor due dates and overdue complaints
* Receive notifications

### Admin

* View all complaints
* Dashboard analytics and statistics
* Search and filter complaints
* Assign complaints to faculty
* Update complaint status and priority
* Monitor high-priority and overdue complaints
* View complaint details
* Archive resolved complaints
* Manage users
* Download Excel reports
* Download PDF reports
* Receive notifications

## Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Axios
* Recharts
* Lucide React
* React Hot Toast

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

### Tools

* Git
* GitHub
* VS Code
* Vercel

## Application Flow

```text
Student
   |
   | Submit Complaint
   v
CampusOne
   |
   v
Admin
   |
   | Assign Complaint
   v
Faculty
   |
   | Update Status
   v
Complaint Resolved
   |
   v
Admin Archive
```

## User Roles

| Role    | Main Responsibilities                          |
| ------- | ---------------------------------------------- |
| Student | Create, track, edit and discuss complaints     |
| Faculty | Manage assigned complaints and update status   |
| Admin   | Monitor, assign, manage and archive complaints |

## Project Structure

```text
CampusOne/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── config/
    ├── server.js
    └── package.json
```

## Authentication

CampusOne uses JWT-based authentication.

The application supports role-based access for:

* Student
* Faculty
* Admin

Passwords are securely hashed before storage, and protected API routes require authentication.

## Complaint Lifecycle

```text
Pending
   ↓
In Progress
   ↓
Resolved
   ↓
Archived
```

Resolved complaints can be archived by administrators.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/rishabhbgt/Campusfrontened.git
cd CampusOne
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create `.env` files for the frontend and backend as required by the project configuration.

Never commit secret keys, database credentials, JWT secrets, or other sensitive values to GitHub.

### 5. Run the frontend

```bash
cd client
npm run dev
```

### 6. Run the backend

```bash
cd server
npm run dev
```

## Production Build

To create a production frontend build:

```bash
npm run build
```

The production build is generated in:

```text
client/dist/
```

## Deployment

The frontend is configured for deployment using Vercel.

The backend can be deployed separately with the required production environment variables and database configuration.

## Future Improvements

* Real-time complaint updates
* Advanced notification preferences
* Better analytics and reporting
* Department-level complaint management
* Improved audit logging
* Expanded role permissions
* Automated complaint escalation

## Author

**Rishabh Kumar**

B.Tech CSE
IES College of Technology, Bhopal

## License

This project is developed as an academic and portfolio project.
