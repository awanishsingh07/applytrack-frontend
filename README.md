# ApplyTrack — Frontend

A responsive React.js frontend for tracking job applications.
Built with Vite, React Router, and Axios.

## 🔗 Links
- **Live App**: https://applytrack-frontend.netlify.app
- **Backend Repo**: https://github.com/awanishsingh07/applytrack-backend

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| React Router v7 | Client-side routing |
| Axios | HTTP client for API calls |
| Netlify | Frontend deployment |
| Cloudinary | PDF resume upload and storage |

---

## ✨ Features

- **Authentication** — Register and login with JWT token storage
- **Protected Routes** — Dashboard accessible only when logged in
- **Resume Management** — Add resumes via PDF upload or Google Drive URL
- **Application Tracking** — Add, update, and delete job applications
- **Status Management** — Track status: Applied, Shortlisted, Interview, Offered, Rejected, Ghosted
- **Filter by Status** — Filter applications by current status
- **Sort by Date** — Sort newest or oldest first
- **Stats Dashboard** — Visual count of applications per status
- **Responsive Design** — Works on mobile and desktop
- **Auto Token Attachment** — Axios interceptor adds JWT to every request

---

## 📁 Project Structure

```
src/
├── api/
│   └── axios.js              ← Axios instance with base URL + JWT interceptor
├── context/
│   └── AuthContext.jsx       ← Global auth state (token, login, logout)
├── pages/
│   ├── Login.jsx             ← Login page
│   ├── Register.jsx          ← Register page
│   └── Dashboard.jsx         ← Main dashboard (resumes + applications)
├── App.jsx                   ← Routes + protected route logic
└── main.jsx                  ← React app entry point
public/
├── _redirects                ← Netlify SPA routing fix
└── favicon.png
```

---

## 🚀 Pages Overview

### Login (`/login`)
- Email and password fields
- Calls `POST /api/auth/login`
- Saves JWT token to localStorage
- Redirects to dashboard on success

### Register (`/register`)
- Name, email, password, confirm password
- Frontend validation (password match, min 6 chars)
- Calls `POST /api/auth/register`
- Redirects to login on success

### Dashboard (`/dashboard`)
- **Stats section** — total applications and count per status (clickable to filter)
- **Resume section** — add/edit/delete resumes, toggle between PDF upload and URL
- **Application section** — add/update/delete applications with filter and sort

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- npm

### Step 1 — Clone the repo
```bash
git clone https://github.com/awanishsingh07/applytrack-frontend.git
cd applytrack-frontend
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Create `.env.local`
```env
VITE_API_URL=http://localhost:8080
```

### Step 4 — Run the app
```bash
npm run dev
```

App starts at `http://localhost:5173`

### Step 5 — Build for production
```bash
npm run build
```

Output goes to `dist/` folder.

---

## 🌍 Deployment (Netlify)

### Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://applytrack-backend.onrender.com` |

### Deploy steps
1. Push code to GitHub
2. Connect repo to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable `VITE_API_URL`
5. Deploy

### SPA Routing Fix
The `public/_redirects` file contains:
```
/* /index.html 200
```
This tells Netlify to serve `index.html` for all routes so React Router works correctly on page refresh.

---

## 🔐 Auth Flow

```
User logs in → JWT token received → 
Stored in localStorage → 
Axios interceptor attaches token to every request → 
Protected routes check token via AuthContext →
Logout clears token from localStorage
```