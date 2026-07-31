# 06 — Frontend Guide

## Stack

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Axios, react-hot-toast, Lucide icons.

Typography: **Fraunces** (display) + **Manrope** (body).  
Theme: clinic teal (`--brand`) with warm accent — not purple/indigo AI defaults.

## Route map

### Public

| Path | Page |
|------|------|
| `/` | Marketing home |
| `/doctors`, `/doctors/[id]` | Doctor directory / detail |
| `/login`, `/register`, `/forgot-password` | Auth |
| `/privacy`, `/terms`, `/contact` | Legal / contact |

### Patient (`/patient/*`)

Dashboard, book, appointments, prescriptions, payments, profile, notifications.

### Doctor (`/doctor/*`)

Dashboard, today’s queue + prescribe, patients, availability, settings, notifications.

### Staff (`/staff/*`)

Dashboard, appointments, walk-in registration, billing, live queue.

### Admin (`/admin/*`)

Overview analytics, doctors, patients, staff, appointments, departments, billing, notifications.

## Auth wiring

- `AuthProvider` wraps the app in `layout.tsx`
- Tokens: `dc_access_token`, `dc_refresh_token`, `dc_user` in `localStorage`
- After login, redirect via `ROLE_HOME` map in `src/config`
- Protected pages call `useRequireAuth(['PATIENT'])` (etc.)

## API client

`src/lib/api.ts` — axios instance with:

- Request interceptor (Bearer)
- Response interceptor (401 → refresh queue)

Domain wrappers live in `src/services/api.ts` (`authApi`, `doctorsApi`, …).

## UI building blocks

- `DashboardShell` — sidebar + header for role workspaces
- `StatCard`, `EmptyState`
- Shared CSS utilities in `globals.css` (`.btn`, `.input`, `.badge-*`, `.table-wrap`)

## Environment

```env
NEXT_PUBLIC_APP_NAME=DoctorCare
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000
```

Copy from `frontend/.env.example` → `frontend/.env.local`.
