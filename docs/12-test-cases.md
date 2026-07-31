# 12 — Test Cases Catalog

IDs use `TC-<AREA>-<NNN>`. Priority: P0 critical, P1 high, P2 medium.

## Auth

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-AUTH-001 | P0 | Patient register | POST `/auth/register` valid body | 201, tokens, role PATIENT |
| TC-AUTH-002 | P0 | Duplicate email | Register same email twice | 409 Conflict |
| TC-AUTH-003 | P0 | Login success | Valid credentials | 200 + access/refresh |
| TC-AUTH-004 | P0 | Login wrong password | Bad password | 401 |
| TC-AUTH-005 | P0 | Me endpoint | GET `/auth/me` with token | Current user profile |
| TC-AUTH-006 | P1 | Refresh token | POST `/auth/refresh` | New token pair |
| TC-AUTH-007 | P1 | Logout | Logout then use access token | 401 revoked |
| TC-AUTH-008 | P1 | Doctor cannot self-register | Register role DOCTOR | 403 |
| TC-AUTH-009 | P2 | Forgot password | Unknown email | Generic success message |

## Doctors & slots

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-DOC-001 | P0 | List doctors | GET `/doctors` | Array + pagination meta |
| TC-DOC-002 | P0 | Filter by department | `?departmentId=` | Only that dept |
| TC-DOC-003 | P0 | Available slots | GET slots for weekday | Non-empty when schedule exists |
| TC-DOC-004 | P0 | No slots on holiday | Add holiday, request date | Empty + reason |
| TC-DOC-005 | P1 | Past slots today | Request today’s morning after noon | Past times excluded |
| TC-DOC-006 | P1 | Admin create doctor | POST `/doctors` | User+doctor+schedules |
| TC-DOC-007 | P2 | Update schedule | PUT schedule | New slots reflected |

## Appointments

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-APT-001 | P0 | Book valid slot | Patient books free slot | PENDING + queueNumber |
| TC-APT-002 | P0 | Double book same slot | Second book same slot | 409 Conflict |
| TC-APT-003 | P0 | Patient cancel | PUT status CANCELLED | Cancelled + notification |
| TC-APT-004 | P0 | Doctor accept | PUT CONFIRMED | Patient notified |
| TC-APT-005 | P0 | Doctor reject | PUT REJECTED | Status updated |
| TC-APT-006 | P1 | Staff check-in | PUT CHECKED_IN | Status updated |
| TC-APT-007 | P1 | Patient cannot confirm | Patient PUT CONFIRMED | 403 |
| TC-APT-008 | P1 | Role scoping | Doctor lists appointments | Only own doctorId |
| TC-APT-009 | P2 | Today queue | GET queue/today | Ordered by queueNumber |
| TC-APT-010 | P2 | Reschedule to free slot | Change date/time | APPOINTMENT_RESCHEDULED notify |

## Prescriptions

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-RX-001 | P0 | Create prescription | Doctor POST medicines | Created; appointment COMPLETED |
| TC-RX-002 | P0 | Duplicate Rx | Second POST same appointment | 409 |
| TC-RX-003 | P1 | Patient read own Rx | GET prescription | 200 |
| TC-RX-004 | P1 | Other patient denied | Wrong patient token | 403 |

## Billing

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-BILL-001 | P0 | Create bill | Staff POST charges | Totals computed |
| TC-BILL-002 | P0 | Pay bill | POST `/bills/:id/pay` | PAID + notification |
| TC-BILL-003 | P1 | Duplicate bill | Second create same appointment | 409 |
| TC-BILL-004 | P1 | Patient sees own bills | GET `/bills` as patient | Scoped list |

## Admin / staff ops

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-ADM-001 | P0 | Dashboard stats | GET `/dashboard` as admin | Counts + revenue |
| TC-ADM-002 | P1 | Create department | POST `/departments` | Created unique slug |
| TC-ADM-003 | P1 | Create staff | POST `/staff` | STAFF user created |
| TC-ADM-004 | P2 | Audit logs | GET `/audit-logs` | Recent actions |

## Frontend UAT

| ID | Priority | Title | Steps | Expected |
|----|----------|-------|-------|----------|
| TC-UI-001 | P0 | Landing loads | Open `/` | Brand hero + CTA |
| TC-UI-002 | P0 | Login redirect | Login as patient | Lands `/patient` |
| TC-UI-003 | P0 | Book flow UI | Select doctor/date/slot | Success toast + list update |
| TC-UI-004 | P0 | Doctor prescribe UI | Prescribe from queue | Rx appears for patient |
| TC-UI-005 | P1 | Staff walk-in | Register patient | Appears in patient table |
| TC-UI-006 | P1 | Staff billing UI | Create + collect | Status PAID |
| TC-UI-007 | P1 | Unauthorized route | Patient opens `/admin` | Redirect / toast denied |
| TC-UI-008 | P2 | Responsive sidebar | Mobile width | Menu toggles |

## Unit tests mapped to automation

| Catalog area | Automated in |
|--------------|--------------|
| Helpers / slots math | `backend/tests/helpers.test.ts` |
| JWT / password | `backend/tests/auth-utils.test.ts` |
| Zod contracts | `backend/tests/validators.test.ts` |
| Errors | `backend/tests/errors.test.ts` |
| Frontend formatters | `frontend/tests/utils.test.ts` |
| Frontend config | `frontend/tests/config.test.ts` |
