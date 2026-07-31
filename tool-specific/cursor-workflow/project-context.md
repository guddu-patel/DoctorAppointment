# Project Context (Cursor)

DoctorCare — Doctor Appointment Management System.

- Monorepo: `backend/` (Express + Prisma + PostgreSQL), `frontend/` (Next.js App Router).
- Auth: JWT access + refresh, RBAC roles SUPER_ADMIN, ADMIN, DOCTOR, STAFF, PATIENT.
- **Critical:** Appointment status transitions are owned solely by `backend/src/domain/appointment-status.ts`. Never bypass via raw Prisma updates in controllers.
- Validate with Zod; return standard API envelopes.
- Do not commit secrets. Prefer smallest change that meets acceptance criteria.
