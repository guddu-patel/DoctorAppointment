# DoctorCare — Appointment Management System

Full-stack clinic platform for patients, doctors, staff, and admins.

## Documentation

Full project docs live in [`docs/`](./docs/README.md):

- Architecture, database, API reference
- Implementation & frontend guides
- Security, setup/deployment, workflows
- Roles/permissions, testing strategy & test case catalog

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT access + refresh tokens, bcrypt, RBAC |
| Tests | Vitest (+ coverage) |

## Project structure

```
Doctor appointment Management/
├── backend/                 # Express API
│   ├── prisma/              # schema + seed
│   ├── src/
│   └── tests/               # unit + HTTP smoke tests
├── frontend/                # Next.js UI
│   ├── src/
│   └── tests/
├── docs/                    # Architecture & project documentation
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- PostgreSQL running locally

## Setup

### 1. Database

```
DATABASE_URL=postgresql://postgres:12345@localhost:5432/doctor_appointment?schema=public
```

Configured in `backend/.env` (see `backend/.env.example`).

### 2. Backend

```bash
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

API: http://localhost:4000/api/v1

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

## Tests

```bash
# from root
npm test
npm run test:coverage

# or per package
cd backend && npm test && npm run test:coverage
cd frontend && npm test && npm run test:coverage
```

See [`docs/11-testing-strategy.md`](./docs/11-testing-strategy.md) and [`docs/12-test-cases.md`](./docs/12-test-cases.md).

## Demo accounts

Password for all: `Password@123`

| Role | Email |
|------|-------|
| Super Admin | admin@doctorcare.local |
| Doctor | doctor@doctorcare.local |
| Staff | staff@doctorcare.local |
| Patient | patient@doctorcare.local |

Also seeded: `cardio@doctorcare.local`, `derm@doctorcare.local`, `patient2@doctorcare.local`

## Working features

- Auth: register (patient), login, logout, refresh, forgot-password stub, JWT RBAC
- Public: home, doctors directory, doctor detail, privacy/terms/contact
- Patient: dashboard, book slots, appointments, cancel, prescriptions, pay bills, profile, notifications
- Doctor: dashboard, today's queue, accept/reject/check-in, prescribe, patients, availability
- Staff: dashboard, appointments, walk-in registration, billing/invoices, live queue
- Admin: dashboard analytics, doctors, patients, staff, appointments, departments, billing reports

## API overview

Base: `/api/v1` — full reference in [`docs/04-api-reference.md`](./docs/04-api-reference.md)

## Notes

- Optional modules (Twilio SMS, Stripe/Razorpay, FCM, S3) are structured for later plug-in via services.
- Email reset currently returns a safe stub until SMTP is configured in `.env`.
