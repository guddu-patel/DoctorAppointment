# 01 — Project Overview

## Purpose

DoctorCare is a healthcare appointment platform that lets:

- **Patients** register, search doctors, book/reschedule/cancel visits, view prescriptions, and pay bills
- **Doctors** manage availability, accept/reject appointments, write prescriptions, and track today’s queue
- **Staff / Reception** register walk-ins, check-in patients, manage queues, and collect payments
- **Admins** manage doctors, patients, staff, departments, appointments, and billing reports

The system reduces waiting time and keeps clinical, scheduling, and billing data in one place.

## Goals

1. Reliable online appointment booking with live slot availability
2. Clear role-based workspaces (Patient, Doctor, Staff, Admin)
3. Traceable visit lifecycle: Pending → Confirmed → Checked-In → Completed
4. Prescriptions and billing attached to appointments
5. Scalable, maintainable codebase ready for SMS, push, and payment gateways

## Out of scope (current release)

- Real SMS (Twilio) / push (FCM) delivery — in-app notifications only
- Live Stripe/Razorpay checkout — payment status recording supported
- Multi-hospital tenancy / multi-language / full PWA offline mode
- Telemedicine video calls

These are designed as plug-in services later.

## Technology stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT access + refresh tokens, bcrypt |
| Validation | Zod |
| Email (optional) | Nodemailer (configured via env) |
| Tests | Vitest (backend + frontend unit tests) |

## Repository layout

```
Doctor appointment Management/
├── backend/          # Express API + Prisma
├── frontend/         # Next.js UI
├── docs/             # This documentation
├── package.json      # Root convenience scripts
└── README.md
```

## Version

- **Application:** 1.0.0
- **API version:** `v1` (`/api/v1`)
