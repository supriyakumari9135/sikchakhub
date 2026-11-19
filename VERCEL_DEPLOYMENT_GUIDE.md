# Vercel Deployment Guide for SikchaKhub Frontend

This guide covers how to deploy the SikchaKhub React frontend on Vercel with zero 404 page-refresh/reload errors.

---

## 1. Why Reload Errors Occur & How It Was Resolved

In Single Page Applications (SPAs) built with React Router and Vite, client-side routing changes the URL dynamically in the browser (e.g. `/login`, `/verify-otp`, `/teacher-dashboard`, `/jobs`).

When a user hard-refreshes (reloads) the page or navigates directly to a URL, Vercel looks for a static file at that path (e.g. `/verify-otp`). If that file does not exist, Vercel serves a `404: NOT_FOUND` error.

### Solution Applied:
- Added `frontend/vercel.json` and root `vercel.json` with universal SPA rewrites:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- Any requested route is automatically rewritten internally to `/index.html`, where React Router takes over and renders the exact requested page.
- Added explicit `base: "/"` in `frontend/vite.config.ts` to ensure asset chunk URLs are always root-relative.
- Configured production security headers and cache-control rules.

---

## 2. Deploying on Vercel (Recommended Option: Root Directory = `frontend`)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
2. Select your GitHub repository (`sikchakhub`).
3. In the **Configure Project** screen:
   - **Project Name:** `sikchakhub` (or your choice)
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build Command:** `npm run build` (or leave default `tsc && vite build`)
   - **Output Directory:** `dist` (default for Vite)
   - **Install Command:** `npm install`
4. Expand **Environment Variables** and add:
   | Variable Name | Value | Description |
   |:---|:---|:---|
   | `VITE_API_BASE_URL` | `https://your-api-domain.com` | Live backend API URL |
   | `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase Web API Key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Firebase Auth Domain |
   | `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` | Firebase Storage Bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1079...` | Firebase Messaging Sender ID |
   | `VITE_FIREBASE_APP_ID` | `1:...:web:...` | Firebase Web App ID |
   | `VITE_FIREBASE_MEASUREMENT_ID` | `G-...` | Optional Google Analytics ID |
5. Click **Deploy**.

---

## 3. Alternative: Deploying from Repository Root (`.`)

If you leave **Root Directory** as `.` (root), the project is pre-configured with:
- Root `package.json` with `npm run build` mapping to `npm --prefix frontend run build`.
- Root `vercel.json` pointing `outputDirectory` to `frontend/dist` with the same SPA rewrites and headers.

---

## 4. Verification Checklist

- [x] Hard-refresh on `/` (Homepage) -> Loads instantly.
- [x] Hard-refresh on `/jobs` -> Loads jobs directory without 404.
- [x] Hard-refresh on `/login` and `/signup` -> Loads auth portals without 404.
- [x] Hard-refresh on `/verify-otp` -> Loads dual-factor OTP verification without 404.
- [x] Hard-refresh on `/teacher-dashboard` -> Authenticated route loads cleanly.
- [x] Hard-refresh on `/employer-dashboard` -> Recruiter console loads cleanly.
- [x] Hard-refresh on `/admin-dashboard` -> Admin console loads cleanly.
- [x] 404 fallback route -> Unrecognized URLs cleanly redirect to homepage.
