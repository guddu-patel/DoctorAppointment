# Requirements Analysis

## Selected project option

**Doctor Appointment Management System** — full-stack clinic platform (Next.js frontend + Express/Prisma backend).

## My understanding (own words)

Patients book doctors online using real availability slots. Doctors and staff move each visit through a controlled lifecycle (pending → confirmed → checked-in → completed, with cancel/reject/no-show exits). Prescriptions and bills attach to appointments. Admins manage people, departments, and reporting. The backend owns rules (slots, RBAC, status machine); the UI never invents status shortcuts.

## Functional requirements

### Core

- Patient self-registration and login (JWT)
- Doctor directory + available slot query
- Book / cancel appointments with queue numbers
- Doctor accept/reject and staff check-in
- Prescription create on consultation
- Soft-delete friendly data model (users/doctors/patients/appointments)
- Role-scoped dashboards (Patient, Doctor, Staff, Admin)
- Input validation (Zod) and consistent API envelope

### Stretch

- Refresh tokens + logout blacklist
- In-app notifications on book/confirm/cancel/pay/Rx
- Billing create + pay + revenue on admin dashboard
- Live queue per doctor
- Weekly availability management
- Vitest unit + HTTP integration tests
- Full docs lifecycle + chat export + candidate info
- Audit logging

### Deferred (intentional omissions)

- Live Twilio SMS / FCM push delivery
- Stripe/Razorpay checkout sessions
- Multi-hospital tenancy
- Full PWA offline / i18n

## Non-functional requirements

| NFR | Approach |
|-----|----------|
| Security | bcrypt, JWT, Helmet, CORS allowlist, rate limit, RBAC |
| Maintainability | Layered folders, Zod schemas, domain state machine |
| Reliability | Slot conflict checks; illegal status rejected server-side |
| Observability | Audit logs + notifications |
| Testability | Pure domain module + HTTP tests with seed users |

## Assumptions

1. Soft-delete (`deletedAt`) is used for people and appointments; hard delete only in test cleanup.
2. One clinic (single-tenant) for this release.
3. Slot length comes from doctor schedule (`slotMins`).
4. SUPER_ADMIN/ADMIN may override status for operational recovery; doctors/staff/patients cannot.
5. Demo SMTP is stubbed; forgot-password does not enumerate emails.

## Clarifications (for a product owner)

1. Should rejected appointments free the slot immediately? **Yes (implemented).**
2. Can patients reschedule freely or only before confirmation? **Reschedule allowed if slot free (implemented).**
3. Is insurance verification workflow required now? **Deferred.**

## Edge cases

| Edge case | Expected behavior |
|-----------|-------------------|
| Double-book same slot | 409 Conflict |
| Patient sets CONFIRMED | 403 Forbidden |
| PENDING → COMPLETED (doctor) | 400 Illegal transition |
| Cancel after COMPLETED | 400 Bad Request |
| Doctor on holiday | Empty slots + reason |
| Weekend with no schedule | Empty slots |
| Inactive user login | 403 |
| Duplicate email register | 409 |
| Bill twice for one appointment | 409 |
| Prescription twice for one appointment | 409 |
