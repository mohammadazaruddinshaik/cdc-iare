# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This repo (`cdc-iare`) contains only the **frontend client** for a QR-code based college attendance system. There is no backend code here — the app talks to an external API (configured via `VITE_BASE_URL`) for auth, attendance, timetables, reports, etc. If backend work is needed, it lives in a separate repository/service.

## Commands

All commands run from this `client/` directory (the actual project root — `package.json`, configs, and `src/` all live here).

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint over the project

There is no test suite configured in this project (no test runner/script exists).

## Environment variables

Vite env vars (`.env`, gitignored) consumed by the app:
- `VITE_BASE_URL` — base URL of the backend API, used by the Axios instance in `src/api/axiosConfig.js`
- `VITE_ENC_KEY` — AES secret key used to decrypt the session payload returned by `/api/me` (see Auth below)

## Architecture

### Routing & role-based access

`src/App.jsx` defines all routes with `react-router-dom`. Routes are grouped by role and gated with `src/components/ProtectedRoute.jsx`:
- Public: `/` (login)
- Shared (any authenticated user): `/leaderboard`, `/timetable`
- Shared admin+faculty (`allowedRoles={['admin','faculty']}`): posting/marking attendance, batch reports, faculty actions
- Admin-only (`requiredRole="admin"`): `/admin/*` management and reporting pages
- Faculty-only (`requiredRole="faculty"`): `/faculty/*` pages
- Student-only (`requiredRole="student"`): `/student/*`, `/logs`, `/inbox`

`ProtectedRoute` reads `user` from `AuthContext`. If there's no user it redirects to `/`. If the user's role isn't in the allowed list, it renders a 404 `ErrorPage` instead of an "unauthorized" page — a deliberate choice to avoid revealing that a route exists to users who shouldn't see it.

Pages are organized under `src/pages/` by audience: `AdminPages/`, `FacultyPages/`, `StudentPages/`, `CommonPages/` (shared across roles, e.g. login, leaderboard, attendance posting/viewing). All routes except the login page are lazy-loaded (`React.lazy`) and wrapped in a `Suspense`/`Loader` boundary (`SessionGuard` in `App.jsx`).

### Auth flow

`src/context/AuthContext.jsx` manages session state:
- On mount (except on `/`), it calls `GET /api/me`. The backend returns an **AES-encrypted** payload (`CryptoJS.AES`, key = `VITE_ENC_KEY`); the context decrypts and JSON-parses it into `{ userId, username, role, sem, batch }`.
- `login(userData)` sets user state directly (called after a successful login request elsewhere).
- `logout()` calls `POST /api/logout`, clears user state, and hard-redirects to `/`.
- Auth relies on cookies (`withCredentials: true` in Axios), not tokens in JS state — the encrypted `/api/me` payload is just how the client learns who the cookie belongs to.

### API client & global error handling

`src/api/axiosConfig.js` exports a shared Axios instance (`baseURL: VITE_BASE_URL`, `withCredentials: true`). Its response interceptor dispatches global `window` events instead of throwing everywhere:
- No `error.response` (network down) → dispatches `app-network-error`
- `error.response.status >= 500` → dispatches `app-server-error`

`App.jsx` listens for both events at the top level and swaps the entire app out for `ErrorPage` (type `network`/`server`) until the user retries. Separately, `NetworkGuard` (defined in `App.jsx`) wraps specific high-value routes (dashboards, leaderboard) to show an offline error immediately based on `navigator.onLine`/online-offline events, independent of a failed request. `src/hooks/Network.jsx` also exposes a `useNetworkStatus` hook and a similar offline UI, used elsewhere in the app.

### QR attendance

`src/components/QrScanner.jsx` wraps `html5-qrcode` for scanning. Attendance is posted/marked from `CommonPages/PostAttendancePage.jsx`, `CommonPages/MultiBatchAttendancePage.jsx` (multi-batch sessions), and `FacultyPages/FacultyMarkAttendancePage.jsx`. Reporting/analytics views (`FacultySessionAnalytics`, `SessionWiseReportPage`, `MonthlyReportPage`, `BatchWiseReportPage`, `LeaderBoardPage`) use `recharts` (`BarChart.jsx`, `DonutChart.jsx` are shared chart components).

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Custom theme colors (`offwhite`, `taupe`, `navy`, `black`) and font (`Poppins`) are defined in `tailwind.config.js`.

### Deployment

Deployed on Vercel; `vercel.json` rewrites all paths to `/index.html` for client-side routing (SPA fallback).
