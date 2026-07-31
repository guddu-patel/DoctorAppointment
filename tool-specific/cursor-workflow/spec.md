# Spec (Cursor)

## Must

- Enforce appointment state machine for every status change.
- Prevent double-booking.
- Scope lists by role (patient/doctor).
- Keep layered architecture.

## Must not

- Put business rules only in the frontend.
- Introduce new frameworks without request.
- Log or commit secrets.

## Done when

Acceptance criteria Core checkboxes are met and `backend`/`frontend` tests pass.
