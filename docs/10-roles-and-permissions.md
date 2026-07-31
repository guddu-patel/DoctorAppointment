# 10 — Roles & Permissions

## Roles

| Role | Dashboard | Notes |
|------|-----------|-------|
| `SUPER_ADMIN` | `/admin` | Full bypass on `authorize()` |
| `ADMIN` | `/admin` | Clinic management |
| `DOCTOR` | `/doctor` | Own schedule & patients |
| `STAFF` | `/staff` | Front desk ops |
| `PATIENT` | `/patient` | Self-service |

## Permission matrix

| Capability | Patient | Doctor | Staff | Admin |
|------------|---------|--------|-------|-------|
| Self register | ✅ | ❌ | ❌ | ❌ |
| Search doctors / slots | ✅ | ✅ | ✅ | ✅ |
| Book own appointment | ✅ | ❌* | ✅ (for patient) | ✅ |
| Cancel own appointment | ✅ | — | ✅ | ✅ |
| Accept / reject / prescribe | ❌ | ✅ | Limited status | ✅ |
| Check-in / queue | ❌ | ✅ | ✅ | ✅ |
| Create walk-in patient | ❌ | ❌ | ✅ | ✅ |
| Create / collect bills | Pay own | View related | ✅ | ✅ |
| Manage doctors / staff / depts | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |

\*Doctors do not self-book via patient UI; they manage clinical side.

## Data scoping rules

- **Patient** lists: forced `patientId = token.patientId`
- **Doctor** lists: forced `doctorId = token.doctorId`
- **Staff / Admin**: may filter by query params
- Prescription access checked against owning doctor/patient

## Status change rules (service-enforced)

| Actor | Allowed next statuses |
|-------|------------------------|
| Patient | `CANCELLED` only (if not already terminal) |
| Doctor | `CONFIRMED`, `REJECTED`, `CHECKED_IN`, `COMPLETED`, `NO_SHOW` |
| Staff / Admin | Any |
