# Test Results

**Date:** 2026-08-01  
**Commands:**

```bash
cd backend && npm test && npm run test:coverage
cd frontend && npm test && npm run test:coverage
```

## Backend

| Suite | Focus | Result |
|-------|-------|--------|
| `helpers.test.ts` | pagination, slots, slugify | Pass |
| `auth-utils.test.ts` | bcrypt + JWT | Pass |
| `validators.test.ts` | Zod contracts | Pass |
| `errors.test.ts` | AppError hierarchy | Pass |
| `responses.test.ts` | API envelopes | Pass |
| `billing-math.test.ts` | totals | Pass |
| `http.smoke.test.ts` | health/404/validation | Pass |
| `appointment-status.test.ts` | state machine table | Pass |
| `appointment-http.test.ts` | login + status paths | Pass (requires seeded DB) |

Targeted coverage (utils/validators/exceptions/responses/domain): aim ≥85% statements.

## Frontend

| Suite | Focus | Result |
|-------|-------|--------|
| `utils.test.ts` | formatters | Pass |
| `config.test.ts` | role homes | Pass |

Coverage on `src/lib/utils.ts` + `src/config/index.ts`: 100% on last run.

## Manual UAT (sample)

| TC | Result |
|----|--------|
| TC-UI-002 Login redirect by role | Pass |
| TC-APT-002 Double book | Pass (API 409) |
| TC-APT-007 Patient cannot confirm | Pass (API 403) |

## Gaps (honest)

- Playwright e2e not automated in CI.
- Not every row in `12-test-cases.md` is automated yet; priority P0 appointment/auth paths are.
