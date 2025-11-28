# Peer-to-Peer Learning Platform

A full-stack peer-to-peer learning platform built with React, Node.js, Express, and MongoDB. Students can ask questions, teachers can moderate content, and admins can manage users.

## 🌐 Live Demo

**Try it now:** [https://peertopeer-platform.netlify.app/](https://peertopeer-platform.netlify.app/)

> No installation required! Click the link above to see the platform in action.

## 🔗 Repository

**GitHub:** [https://github.com/nehemmy55/Peer-to-Peer-platform](https://github.com/nehemmy55/Peer-to-Peer-platform)

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Running the Application](#running-the-application)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, make sure you have these installed on your computer:

### 1. Node.js (v16 or higher)
**Check if installed:**
```bash
node --version
```
**If not installed:** Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

### 2. npm (comes with Node.js)
**Check if installed:**
```bash
npm --version
```

### 3. MongoDB
**Option A - MongoDB Atlas (Recommended for beginners):**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free cluster
4. Get your connection string (you'll need this later)

**Option B - Local MongoDB:**
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service
3. Default connection: `mongodb://localhost:27017`

### 4. Git
**Check if installed:**
```bash
git --version
```
**If not installed:** Download from [git-scm.com](https://git-scm.com/)

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/nehemmy55/Peer-to-Peer-platform.git
cd Peer-to-Peer-platform
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Folder
```bash
cd backend
```

#### 2.2 Install Backend Dependencies
```bash
npm install
```
This will install all required packages (Express, JWT, MongoDB drivers, etc.)

#### 2.3 Create Environment File

Create a new file named `.env` in the `backend` folder:

**Windows (Command Prompt):**
```cmd
type nul > .env
```

**Windows (PowerShell):**
```powershell
New-Item .env
```

**Mac/Linux:**
```bash
touch .env
```

#### 2.4 Configure Environment Variables

Open the `.env` file in a text editor and add:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/p2p-learning
NODE_ENV=development
```

**Important Notes:**
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a random string (at least 32 characters)
- Example Atlas URI: `mongodb+srv://username:password@cluster.mongodb.net/p2p-learning`

#### 2.5 Verify Backend Setup

Your `backend` folder should now contain:
```
backend/
├── node_modules/     (created by npm install)
├── src/
├── package.json
├── package-lock.json
└── .env             (you just created this)
```

### Step 3: Frontend Setup

#### 3.1 Open a NEW Terminal Window

Keep the first terminal open. Open a second terminal/command prompt.

#### 3.2 Navigate to Frontend Folder

From the project root:
```bash
cd frontend
```

#### 3.3 Install Frontend Dependencies
```bash
npm install
```
This installs React, Vite, Tailwind CSS, and other frontend packages.

#### 3.4 Create Frontend Environment File

Create `.env` in the `frontend` folder:

**Windows (Command Prompt):**
```cmd
type nul > .env
```

**Windows (PowerShell):**
```powershell
New-Item .env
```

**Mac/Linux:**
```bash
touch .env
```

#### 3.5 Configure Frontend Environment

Open the `.env` file and add:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Important:** In Vite, environment variables must start with `VITE_`

#### 3.6 Verify Frontend Setup

Your `frontend` folder should now contain:
```
frontend/
├── node_modules/     (created by npm install)
├── src/
├── package.json
├── package-lock.json
├── .env             (you just created this)
└── index.html
```

---

## ▶️ Running the Application

### Step 1: Start MongoDB

**If using MongoDB Atlas:** No action needed, it's already running in the cloud.

**If using Local MongoDB:**

**Windows:**
- MongoDB should start automatically as a service
- If not, open Services and start "MongoDB Server"

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 2: Start the Backend Server

In your first terminal (in the `backend` folder):

```bash
npm start
```

**Expected output:**
```
Server running on port 3000
Connected to MongoDB
```

**If you see errors:** Check the [Troubleshooting](#troubleshooting) section below.

### Step 3: Start the Frontend Development Server

In your second terminal (in the `frontend` folder):

```bash
npm run dev
```

**Expected output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Open the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the peer-to-peer learning platform homepage!

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication

---

## 📁 Project Structure

```
peer-to-peer-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── QuestionModal.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── QuestionsPage.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── .env
│
└── backend/
    ├── src/
    │   ├── routes/         # API endpoints
    │   │   ├── auth.js
    │   │   ├── questions.js
    │   │   └── answers.js
    │   ├── models/         # Database schemas
    │   │   ├── User.js
    │   │   ├── Question.js
    │   │   └── Answer.js
    │   ├── middleware/     # Custom middleware
    │   │   └── auth.js
    │   └── server.js       # Server entry point
    ├── package.json
    └── .env
```

---

## ✨ Features

### For All Users
- Browse questions and answers
- Search and filter questions
- View user profiles

### For Students
- Ask questions
- Answer other students' questions
- Upvote helpful answers

### For Teachers
- All student features
- Moderate questions and answers
- Mark questions as answered

### For Admins
- All teacher features
- User management (promote/demote roles)
- View platform statistics

---

## 🔧 Troubleshooting

### Backend won't start

**Error: `Cannot find module 'express'`**
- Solution: Run `npm install` in the backend folder

**Error: `MongooseServerSelectionError`**
- MongoDB is not running or connection string is wrong
- Check your `.env` file's `MONGODB_URI`
- If using local MongoDB, make sure the service is running

**Error: `Port 3000 is already in use`**
- Another application is using port 3000
- Solution: Change `PORT=3000` to `PORT=3001` in backend `.env`
- Update frontend `.env` to match: `VITE_API_BASE_URL=http://localhost:3001/api`

### Frontend won't start

**Error: `Cannot find module 'react'`**
- Solution: Run `npm install` in the frontend folder

**Error: `Failed to fetch` when trying to login/signup**
- Backend is not running
- Check that backend terminal shows "Server running on port 3000"

### CORS Errors in Browser Console

**Error: `Access to fetch blocked by CORS policy`**
- Backend CORS configuration issue
- Make sure backend has CORS enabled for `http://localhost:5173`

### Can't create an account

**Check:**
1. Backend terminal for error messages
2. Browser console (F12) for error messages
3. MongoDB connection is working

---

## 📚 Development Scripts

### Frontend Commands
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Create production build
npm run preview      # Preview production build
```

### Backend Commands
```bash
npm start           # Start server
npm run dev         # Start with auto-reload (if configured)
```

---

## 🎯 Next Steps

1. **Create an account** with the role you want to test (Student, Teacher, or Admin)
2. **Explore the features** based on your role
3. **Try making changes** to the code and see them live reload
4. **Read the code** in `frontend/src` and `backend/src` to understand how it works

---

## 🤝 Contributing

This is a learning project! Feel free to:
- Add new features
- Improve the UI/UX
- Fix bugs
- Refactor code
- Add tests

---

## 📝 License

This project is for educational purposes.

---

## 🆘 Still Having Issues?

1. Make sure all prerequisites are installed correctly
2. Delete `node_modules` folders and run `npm install` again
3. Check that both `.env` files are configured correctly
4. Ensure MongoDB is running
5. Check terminal/console for specific error messages

For specific errors, search the error message online or check the project's issue tracker.
