# DoctorCare Documentation

Central documentation for the **Doctor Appointment Management System**.

## Contents

| Doc | Description |
|-----|-------------|
| [Candidate Information](./candidate-info.md) | Author profile, repo links, setup & navigation |
| [Chat History](./chat-history.md) | Exported Cursor build-session conversation |
| [Rubric Score Estimate](./rubric-score-estimate.md) | Predicted score vs ticket-project review rubric |
| [Tool Workflow (Part A)](./tool-workflow.md) | How Cursor was used across the lifecycle |
| [Requirements Analysis](./requirements-analysis.md) | Core vs Stretch, assumptions, edge cases |
| [Acceptance Criteria](./acceptance-criteria.md) | Checkbox AC mapped to delivery |
| [Prompt History](./prompt-history.md) | Accept / Change / Reject prompt log |
| [Debugging Notes](./debugging-notes.md) | Real incidents + root cause + fix |
| [Code Review](./code-review.md) | AC audit; accepted vs rejected suggestions |
| [Test Results](./test-results.md) | Latest automated + manual results |
| [Reflection](./reflection.md) | Honest retrospective |
| [Final AI Usage Summary](./final-ai-usage-summary.md) | Concise AI accountability summary |
| [01 — Project Overview](./01-project-overview.md) | Purpose, scope, goals, tech stack |
| [02 — Architecture](./02-architecture.md) | System design, layers, state machine ownership |
| [03 — Database Design](./03-database-design.md) | Prisma schema, ER relationships, enums |
| [04 — API Reference](./04-api-reference.md) | REST endpoints, auth, envelopes |
| [05 — Implementation Guide](./05-implementation-guide.md) | Backend modules, patterns, conventions |
| [06 — Frontend Guide](./06-frontend-guide.md) | Pages, auth, services, UI system |
| [07 — Security](./07-security.md) | Auth, RBAC, hardening checklist |
| [08 — Setup & Deployment](./08-setup-and-deployment.md) | Local setup, env vars, deploy |
| [09 — User Workflows](./09-user-workflows.md) | Patient / Doctor / Staff / Admin flows |
| [10 — Roles & Permissions](./10-roles-and-permissions.md) | Role matrix and access rules |
| [11 — Testing Strategy](./11-testing-strategy.md) | Frameworks, coverage goals, how to run |
| [12 — Test Cases](./12-test-cases.md) | Functional & API test case catalog |
| [13 — Contributing](./13-contributing.md) | Branching, commits, PR checklist |

## Quick links

- App (dev): `http://localhost:3000`
- API (dev): `http://localhost:4000/api/v1`
- Cursor workflow: [`../tool-specific/cursor-workflow/`](../tool-specific/cursor-workflow/)
- Prompt templates: [`../ai-prompts/`](../ai-prompts/)
- Root README: [`../README.md`](../README.md)

## Demo accounts

Password for all: `Password@123`

| Role | Email |
|------|-------|
| Super Admin | `admin@doctorcare.local` |
| Doctor | `doctor@doctorcare.local` |
| Staff | `staff@doctorcare.local` |
| Patient | `patient@doctorcare.local` |
