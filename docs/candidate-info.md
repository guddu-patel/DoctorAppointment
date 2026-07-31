# Candidate Information

**Full name:** Guddu Kumar (also known as Guddu Patel)  
**Preferred name:** Guddu  
**Email:** guddu.kumar1@tothenew.com  
**GitHub:** [guddu-patel](https://github.com/guddu-patel)  
**Organization / workplace context:** Tothenew (`tothenew.com`)  
**Role:** Developer (full-stack / JavaScript competency)

**Primary technology stack:**  
Next.js 15 (App Router), React 19, TypeScript, Express.js, Prisma, PostgreSQL, Tailwind CSS, Zod, Vitest, Axios, JWT + bcrypt

**Primary AI tool used:** Cursor (Agent + Chat)  
**Project:** Doctor Appointment Management System (Frontend + Backend)

**Assessment / build period:** July–August 2026

## Repository links

| Repo                                 | URL                                              |
| ------------------------------------ | ------------------------------------------------ |
| Monorepo (Frontend + Backend + Docs) | https://github.com/guddu-patel/DoctorAppointment |

Clone:

```bash
git clone https://github.com/guddu-patel/DoctorAppointment.git
cd DoctorAppointment
```

## Project summary

Healthcare clinic platform where:

- **Patients** register, search doctors, book/cancel appointments, view prescriptions, and pay bills
- **Doctors** manage availability, accept/reject visits, prescribe, and run today’s queue
- **Staff** handle walk-ins, check-in, live queue, and billing
- **Admins** manage doctors, patients, staff, departments, appointments, and reports

Data persists in PostgreSQL via Prisma. Auth uses JWT access + refresh tokens with role-based access control (SUPER_ADMIN, ADMIN, DOCTOR, STAFF, PATIENT).

**Evidence of depth:** layered Express architecture, slot generation & double-book prevention, appointment status lifecycle, prescriptions + billing, in-app notifications, audit logs, Vitest unit/smoke suites, and full `docs/` documentation set.

## Tools used

| Tool                | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| Cursor              | AI-assisted analysis, design, coding, testing, review, docs |
| PostgreSQL + Prisma | Persistence, schema push, seed                              |
| Vitest              | Backend + frontend unit tests and coverage                  |
| Express + Zod       | API, validation, RBAC middleware                            |
| Next.js 15          | Patient / Doctor / Staff / Admin dashboards                 |
| GitHub              | Source control for the monorepo                             |

## Setup summary

```bash
git clone https://github.com/guddu-patel/DoctorAppointment.git
cd DoctorAppointment

# Backend
cd backend
cp .env.example .env   # set DATABASE_URL + JWT secrets (>= 32 chars)
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm test
npm run dev            # http://localhost:4000

# Frontend (new terminal)
cd ../frontend
cp .env.example .env.local
npm install
npm test
npm run dev            # http://localhost:3000
```

### Demo logins

Password for all: `Password@123`

| Role        | Email                      |
| ----------- | -------------------------- |
| Super Admin | `admin@doctorcare.local`   |
| Doctor      | `doctor@doctorcare.local`  |
| Staff       | `staff@doctorcare.local`   |
| Patient     | `patient@doctorcare.local` |

Also seeded: `cardio@doctorcare.local`, `derm@doctorcare.local`, `patient2@doctorcare.local`

## How to navigate this submission

| Need                   | Start here                                                     |
| ---------------------- | -------------------------------------------------------------- |
| Docs index             | [`README.md`](./README.md)                                     |
| Overview & goals       | [`01-project-overview.md`](./01-project-overview.md)           |
| Architecture           | [`02-architecture.md`](./02-architecture.md)                   |
| Database / ER          | [`03-database-design.md`](./03-database-design.md)             |
| API contract           | [`04-api-reference.md`](./04-api-reference.md)                 |
| Backend implementation | [`05-implementation-guide.md`](./05-implementation-guide.md)   |
| Frontend guide         | [`06-frontend-guide.md`](./06-frontend-guide.md)               |
| Security               | [`07-security.md`](./07-security.md)                           |
| Setup & deploy         | [`08-setup-and-deployment.md`](./08-setup-and-deployment.md)   |
| User workflows         | [`09-user-workflows.md`](./09-user-workflows.md)               |
| Roles & permissions    | [`10-roles-and-permissions.md`](./10-roles-and-permissions.md) |
| Testing strategy       | [`11-testing-strategy.md`](./11-testing-strategy.md)           |
| Test case catalog      | [`12-test-cases.md`](./12-test-cases.md)                       |
| Test results           | [`test-results.md`](./test-results.md)                         |
| Tool workflow (Part A) | [`tool-workflow.md`](./tool-workflow.md)                       |
| Requirements analysis  | [`requirements-analysis.md`](./requirements-analysis.md)       |
| Acceptance criteria    | [`acceptance-criteria.md`](./acceptance-criteria.md)           |
| Prompt history         | [`prompt-history.md`](./prompt-history.md)                     |
| Debugging notes        | [`debugging-notes.md`](./debugging-notes.md)                   |
| Code review            | [`code-review.md`](./code-review.md)                           |
| Reflection             | [`reflection.md`](./reflection.md)                             |
| Chat history           | [`chat-history.md`](./chat-history.md)                         |
| Contributing           | [`13-contributing.md`](./13-contributing.md)                   |
| Root README            | [`../README.md`](../README.md)                                 |
| Automated tests        | `backend/tests/`, `frontend/tests/`                            |
| Cursor workflow        | [`../tool-specific/cursor-workflow/`](../tool-specific/cursor-workflow/) |
| AI prompts             | [`../ai-prompts/`](../ai-prompts/)                             |

## Contact for reviewers

Please use **guddu.kumar1@tothenew.com** if clarification is needed on the repository, setup, or implementation choices.
