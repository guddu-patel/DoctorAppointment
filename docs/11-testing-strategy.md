# 11 — Testing Strategy

## Goals

- Protect critical business logic (slots, auth tokens, validation, billing math helpers)
- Keep tests fast and deterministic (unit-first)
- Document functional coverage in [12 — Test Cases](./12-test-cases.md)

## Tooling

| Area | Tool |
|------|------|
| Backend unit | Vitest |
| Frontend unit | Vitest + jsdom |
| Coverage | `@vitest/coverage-v8` |

## What we automate

### Backend (`backend/tests`)

- Helpers: pagination, slugify, time/slot generation, bill numbers
- Auth crypto: hash/compare password, sign/verify JWT, refresh expiry
- Zod schemas: register/login/appointment/prescription/bill
- AppError hierarchy
- API health smoke (optional integration when server app exported)

### Frontend (`frontend/tests`)

- `lib/utils`: money/date formatting, status badge class, initials
- Config role home map sanity

## Coverage targets

| Package | Statements | Branches | Functions |
|---------|------------|----------|-----------|
| Backend utils + validators | ≥ 90% | ≥ 85% | ≥ 90% |
| Frontend utils | ≥ 90% | ≥ 80% | ≥ 90% |
| Overall services (phase 2) | ≥ 70% | ≥ 60% | ≥ 70% |

Phase 2 (recommended next): service tests with Prisma mocked / test DB.

## Commands

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:coverage
```

## Manual / exploratory

Use the catalog in `12-test-cases.md` for UI UAT before releases.
