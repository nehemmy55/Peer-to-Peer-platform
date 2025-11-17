# Peer-to-Peer Learning Platform

A small full-stack peer-to-peer learning platform (demo) with a Vite + React frontend and a Node/Express backend. Built with Tailwind CSS for styling and lucide-react icons.

This README explains how to run the project locally (Windows examples included), where key files live, and common troubleshooting tips.

---

## Table of contents

- Project overview
- Tech stack
- Project structure
- Quick start (Windows cmd)
- Frontend (dev & build)
- Backend (dev & API)
- Environment variables
- Testing
- Troubleshooting & common issues
- Contributing
- License

---

## Project overview

This repository contains a sample peer-to-peer Q&A platform with:

- Frontend: React + Vite + Tailwind CSS. UI components split into `src/components` and `src/pages`.
- Backend: Node/Express API (under `backend/`) with simple routes for auth, questions, and answers (demo data and examples).

The UI demonstrates questions, contributors, resources, basic auth flows, and a teacher moderation view.


## Tech stack

- React 18 (Vite)
- Tailwind CSS
- lucide-react (icons)
- Node.js + Express (backend)
- Fetch-based client API calls to `/api/*`


## Project structure (important files)

- `frontend/` — React app (Vite)
  - `package.json` — frontend scripts & deps
  - `index.html`, `src/main.jsx` — app entry
  - `src/App.jsx` — app shell and state management
  - `src/components/` — reusable UI components (NavBar, AuthModal, QuestionModal, etc.)
  - `src/pages/` — page components (HomePage, QuestionsPage, ResourcesPage, ContributorsPage, etc.)
  - `src/index.css` — imports Tailwind base utilities
  - `vite.config.js` — Vite configuration

- `backend/` — Express API
  - `package.json` — backend scripts & deps
  - `src/server.js` — server entrypoint
  - `src/routes/` — endpoints (questions, answers, auth)
  - `src/models/` — example data models (mongoose-like stubs or schemas)
  - `src/middleware/auth.js` — auth middleware


## Quick start (Windows cmd)

Open two terminals (one for backend, one for frontend). Commands below use Windows cmd.EXE; if you use PowerShell or WSL, adapt accordingly.

1) Install dependencies

```cmd
cd d:\new\backend
npm install

cd d:\new\frontend
npm install
```

2) Start backend (dev)

```cmd
cd d:\new\backend
npm start
```

By default the backend server listens on its configured port (check `backend/src/server.js` or `backend/package.json` `scripts`).

3) Start frontend (dev)

```cmd
cd d:\new\frontend
npm start
```

Vite will print the local URL (usually http://localhost:5173 or 5174). Open that in your browser.


## Frontend details

- Dev: `npm start` (runs `vite`)
- Build (production): `npm run build` (output in `dist/`)
- Preview production build locally: `npm run preview`
- Entry: `src/main.jsx` which mounts `App` from `src/App.jsx`.

Note: `App.jsx` holds global state and passes props into page components in `src/pages/`.


## Backend details

- Dev: `npm start` (check `backend/package.json` for the exact command)
- API urls used by the frontend are relative (e.g., `/api/questions`, `/api/auth/login`). If you run backend on a different port, set up a proxy or update API base URLs.

If the frontend is served by Vite and the backend on another port (e.g., 3000), create a simple proxy using Vite's `server.proxy` in `vite.config.js` or run both and use absolute API URLs in the frontend.


## Environment variables

If the backend expects env variables (JWT secrets, DB URLs), add a `.env` file in `backend/` (do not commit secrets).

Example (backend/.env):

```
PORT=3000
JWT_SECRET=changeme
MONGO_URI=mongodb://localhost:27017/p2p-demo
```

Tailwind generally does not require env vars; Vite config may reference `process.env` inside `vite.config.js` if customized.


## Testing

This repo includes demo data and minimal logic. There are no automated tests by default. To add tests, consider Jest + React Testing Library for the frontend and Mocha/Jest for backend.



## Developer notes: components/pages collision

If you previously extracted components into `src/components` and `src/pages` but still have their definitions in `src/App.jsx`, remove the duplicate definitions in `App.jsx` and import the extracted components instead. The current repository should already have `src/components/*` and `src/pages/*`—`App.jsx` should only keep state and pass props into those components.

Key files to inspect:
- `src/App.jsx` — global state and routing via `currentPage`
- `src/components/NavBar.jsx`
- `src/components/AuthModal.jsx`
- `src/pages/HomePage.jsx`, `QuestionsPage.jsx`, `ResourcesPage.jsx`, `ContributorsPage.jsx`


## Contributing

- Create issues for bugs or feature requests.
- For small fixes, open a PR on `main`. Provide a short description and a dev/test checklist.


## License

Add your license here (e.g., MIT). If you want me to add a LICENSE file, tell me which license to use and I'll add it.




