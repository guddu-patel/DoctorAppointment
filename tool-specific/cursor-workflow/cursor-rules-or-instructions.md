# Cursor Rules / Instructions

1. Business rules live in `services/` or `domain/` — not in route files alone.
2. Appointment status changes MUST call `assertAppointmentStatusChange`.
3. Prefer editing existing patterns over new abstractions.
4. Add or update tests when changing status, billing, or auth behavior.
5. Update `docs/acceptance-criteria.md` if behavior changes.
6. Never disable auth middleware to “make the UI work”.
7. For nested Prisma creates with relations, use `connect` / `create` explicitly.
8. Keep commits intentional; mention AC or module in the message when possible.
