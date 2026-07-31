# Code Review Notes

Strict acceptance-criteria review of DoctorCare (Cursor-assisted + human judgment).

## Accepted fixes

| Finding | Decision | Fix |
|---------|----------|-----|
| Status rules only in service private method | Accept | Extract `domain/appointment-status.ts` |
| No HTTP proof of illegal transitions | Accept | Add `appointment-http.test.ts` |
| Missing Part A workflow artifacts | Accept | Add tool-workflow, requirements, AC, prompts |
| Seed used scalar `departmentId` with nested user | Accept | Use `department: { connect }` |
| Book page `useSearchParams` without Suspense | Accept | Suspense boundary |
| `.env` risk on commit | Accept | Root `.gitignore` + verify before push |

## Rejected suggestions

| Suggestion | Why rejected |
|------------|--------------|
| Put status transition checks only in Next.js UI | Backend must own rules; UI can be bypassed |
| Use `CORS_ORIGIN=*` in production example | Too permissive; keep explicit origin in examples |
| Skip refresh-token rotation for “simplicity” | Stretch security already implemented; don’t regress |
| Auto-confirm every booking | Violates doctor/staff workflow AC |
| Commit real `.env` for “easier setup” | Secrets policy |

## Residual risks (honest)

- Forgot-password is a safe stub until SMTP is configured.
- Admin status override is intentional for ops; audit logs should be monitored.
- Playwright e2e not in CI yet (catalogued as follow-up).
