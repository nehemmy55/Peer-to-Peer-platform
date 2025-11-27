

```markdown
# Peer-to-Peer Learning Platform

A full-stack peer-to-peer learning platform built with modern web technologies. This project demonstrates real-world full-stack development patterns including authentication, role-based access control, API design, and state management.

 
# Peer-to-Peer Learning Platform

A full-stack peer-to-peer learning platform for students and teachers. This README gives quick, actionable steps to run the project locally, deploy it, and contribute.

---

## Quick links
- Frontend (Vite + React): `frontend/`
- Backend (Node + Express): `backend/`
- Live frontend (Netlify): https://peertopeer-platform.netlify.app
- Live backend (Render): https://peer-to-peer-platform.onrender.com

---

## Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas) for backend

## Quick Start (Windows / cmd.exe)
Open two terminals.

1) Backend
```cmd
cd d:\new\backend
npm install
npm run dev
```

2) Frontend
```cmd
cd d:\new\frontend
npm install
npm run dev
```

Open `http://localhost:5173` for the frontend (Vite default) and `http://localhost:3000` for the backend (if configured).

---

## Environment variables
Create `.env` files.

backend/.env (example):
```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/p2p-learning
NODE_ENV=development
```

frontend/.env (example):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Note: Vite exposes variables that start with `VITE_` to the client.

---

## Project structure (short)

Frontend highlights:
- `frontend/src/App.jsx` - main app and routing
- `frontend/src/pages/` - pages (Questions, Resources, etc.)
- `frontend/src/components/` - reusable UI pieces

Backend highlights:
- `backend/src/server.js` - Express app setup, middleware, route registration
- `backend/src/routes/` - route handlers (`auth.js`, `questions.js`, `resources.js`)
- `backend/src/models/` - Mongoose models (`User.js`, `Question.js`, `Resource.js`)

---

## Development scripts

Frontend (from `frontend/`):
```cmd
npm run dev    # start vite dev server
npm run build  # build production assets
npm run preview# preview production build
```

Backend (from `backend/`):
```cmd
npm run dev    # start backend with nodemon (if configured)
npm start      # start production server
```

---

## Deployment notes

Frontend (Netlify/Vercel):
- Build command: `npm run build` (from `frontend/`)
- Netlify example uses `base = "frontend"` and `publish = "dist"` in `netlify.toml`.
- Ensure `VITE_API_BASE_URL` points to your production backend.

Backend (Render/Heroku/etc):
- Ensure `MONGODB_URI` and `JWT_SECRET` are set in the host's environment
- If using Render, push to GitHub and connect the service to auto-deploy

---

## Resource upload feature
The app includes a resources system (upload links, download tracking). Uploads are handled through `POST /api/resources` on the backend and a modal on the frontend at `frontend/src/components/UploadResourceModal.jsx`.

---

## Troubleshooting
- 404 on deploy: check `netlify.toml` `base` and `publish` settings and that `_redirects` exists in `frontend/public`.
- CORS errors: ensure backend CORS allows your frontend origin (including Netlify preview URLs).
- Login not working: verify `VITE_API_BASE_URL` and backend routes (`/api/auth/login`).

---

## Contributing
- Fork the repo, create a feature branch, and open a pull request.
- Keep changes focused and add tests where relevant.
- For frontend changes, run `npm run dev` in `frontend/` and ensure linting passes.

Suggested first contributions:
- Add unit tests for key components
- Improve form validation
- Add CI (GitHub Actions) for lint/test/build

---

If you want, I can add a `CI` section (GitHub Actions), a `Docker` setup, or detailed deployment guides for Netlify/Render—tell me which you'd like next.

---

© Project – educational purposes

