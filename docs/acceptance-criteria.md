# Acceptance Criteria

## Core

- [x] Patient can register and login; JWT access required for private routes
- [x] Public doctor list/detail and slot query by date
- [x] Patient can book a free slot; appointment starts as `PENDING` with queue number
- [x] Double-booking the same slot is rejected
- [x] Patient can cancel non-terminal appointments only
- [x] Doctor can confirm / reject pending appointments
- [x] Staff/doctor can check-in confirmed appointments
- [x] Status transitions enforced by central module (`appointment-status.ts`) — UI cannot bypass
- [x] Illegal transitions return 400; illegal role actions return 403
- [x] Doctor can create prescription; visit completes
- [x] Role dashboards render for Patient / Doctor / Staff / Admin
- [x] Zod validation on write endpoints; API success/error envelope
- [x] No secrets committed (`.env` gitignored; examples only)

## Validation & errors

- [x] Invalid login body → 422
- [x] Wrong password → 401
- [x] Missing/invalid token → 401
- [x] Consistent `{ success, message, errors?, timestamp }` responses

## Testing

- [x] Unit tests for helpers, auth utils, validators, errors, responses
- [x] Unit tests for appointment state machine table
- [x] HTTP smoke tests (health, 404, validation)
- [x] HTTP integration tests: book → confirm → check-in → complete; illegal patient confirm; illegal graph jump
- [x] `npm test` passes in backend and frontend

## Documentation

- [x] Architecture, DB, API, security, setup, workflows, roles
- [x] Requirements analysis + acceptance criteria + tool workflow
- [x] Debugging notes, code review, reflection, prompt history
- [x] Candidate info + chat history export
- [x] Test strategy, test cases catalog, test results

## Stretch

- [x] Refresh token rotation + logout blacklist
- [x] Notifications on key events
- [x] Billing create/pay + admin revenue stats
- [x] Live queue endpoint + staff UI
- [x] Doctor availability schedule update
- [x] Audit logs API (admin)
- [x] Cursor workflow folder + ai-prompts templates
- [ ] Live SMS/FCM/Stripe (intentionally deferred — documented)
