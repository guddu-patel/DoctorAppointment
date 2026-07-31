# 04 — API Reference

Base URL (local): `http://localhost:4000/api/v1`

## Response envelope

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

Paginated lists also include:

```json
"meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "path": "email", "message": "Invalid email" }],
  "timestamp": "..."
}
```

## Authentication

Most private routes require:

```http
Authorization: Bearer <accessToken>
```

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Patient self-registration |
| POST | `/auth/login` | Public | Login → tokens + user |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | Optional | Blacklist access / revoke refresh |
| POST | `/auth/forgot-password` | Public | Safe stub (no email enumeration) |
| GET | `/auth/me` | JWT | Current user + profile |

### Login body

```json
{ "email": "patient@doctorcare.local", "password": "Password@123" }
```

## Doctors

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/doctors` | Public | List / search / filter by department |
| GET | `/doctors/:id` | Public | Doctor detail + schedules/reviews |
| GET | `/doctors/:id/slots?date=YYYY-MM-DD` | Public | Available slots |
| GET | `/doctors/:id/reviews` | Public | Reviews |
| POST | `/doctors` | Admin | Create doctor + user + default schedule |
| PUT | `/doctors/:id` | Admin, Doctor | Update profile |
| DELETE | `/doctors/:id` | Admin | Soft delete |
| PUT | `/doctors/:id/schedule` | Admin, Doctor | Replace weekly schedule |

## Patients

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/patients` | Admin, Staff, Doctor | List |
| GET | `/patients/:id` | JWT (scoped) | Detail; patients can only read self |
| POST | `/patients` | Admin, Staff | Create (walk-in) |
| PUT | `/patients/:id` | JWT (scoped) | Update |
| DELETE | `/patients/:id` | Admin | Soft delete |

## Appointments

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/appointments` | JWT | Role-scoped list |
| GET | `/appointments/queue/today` | JWT | Today’s queue |
| GET | `/appointments/:id` | JWT | Detail |
| POST | `/appointments` | JWT | Book (slot validation) |
| PUT | `/appointments/:id` | JWT | Status / reschedule |
| DELETE | `/appointments/:id` | JWT | Soft cancel |

### Book body

```json
{
  "doctorId": "...",
  "appointmentDate": "2026-08-01",
  "startTime": "10:00",
  "endTime": "10:30",
  "reason": "Checkup"
}
```

Patients omit `patientId` (taken from token). Staff/Admin may pass `patientId`.

## Prescriptions

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/prescriptions` | JWT | List for patient |
| GET | `/prescriptions/:id` | JWT | Detail |
| POST | `/prescriptions` | Doctor, Admin | Create + mark visit completed |
| PUT | `/prescriptions/:id` | Doctor, Admin | Update |

## Billing

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/bills` | JWT | Role-scoped list |
| GET | `/bills/:id` | JWT | Detail |
| POST | `/bills` | Admin, Staff | Create invoice |
| POST | `/bills/:id/pay` | JWT | Record payment |

## Other

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET/POST/PUT/DELETE | `/departments` | Public list / Admin mutate | Departments |
| GET/POST/DELETE | `/staff` | Admin | Staff accounts |
| POST | `/reviews` | Patient | Rate doctor |
| GET | `/notifications` | JWT | Inbox |
| PATCH | `/notifications/:id/read` | JWT | Mark read |
| PATCH | `/notifications/read-all` | JWT | Mark all read |
| GET | `/dashboard` | JWT | Role analytics |
| GET | `/audit-logs` | Admin | Audit trail |
| GET | `/health` | Public | Liveness |

## Common query params

- `page`, `limit` (max 100)
- `search`
- `sortBy`, `sortOrder` (`asc`|`desc`)
- Domain filters: `departmentId`, `status`, `date`, `doctorId`, `patientId`, `paymentStatus`
