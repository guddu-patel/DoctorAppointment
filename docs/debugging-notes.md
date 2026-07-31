# Debugging Notes

Real issues encountered while building DoctorCare with Cursor — each validated, not blindly accepted.

## 1. Prisma nested create required `department: { connect }` (not only `departmentId`)

**Symptom:** Seed/`doctor.create` failed with `Argument department is missing` even when `departmentId` was set alongside nested `user.create`.

**Root cause:** With nested relation writes, Prisma expects relation ops (`connect` / `create`) for `department`, not a bare scalar FK in that shape.

**Fix:** Use `department: { connect: { id } }` in seed and `doctorService.create`. Documented for future nested creates.

**AI accountability:** Agent first used `departmentId`; validation error was investigated and corrected — not ignored.

## 2. Git `init` ran inside `backend/` because of shell cwd

**Symptom:** First `git init` created `backend/.git` instead of monorepo root.

**Root cause:** Persistent terminal working directory was still `backend/` from prior npm/prisma commands.

**Fix:** Removed nested `.git`, re-initialized at project root, verified `.gitignore` before staging, committed FE+BE together.

## 3. GitHub HTTPS push rejected (password auth unsupported)

**Symptom:** `git push` → `Invalid username or token`.

**Root cause:** GitHub disallows account passwords for Git over HTTPS; PAT/SSH/GitHub Desktop required.

**Fix:** Local commit remained ready; user authenticated and pushed successfully. Documented in chat history.

## 4. Next.js `useSearchParams` without Suspense

**Symptom:** Risk of client bailout / build warning on `/patient/book`.

**Root cause:** `useSearchParams()` in a client page without a Suspense boundary.

**Fix:** Split `BookForm` and wrap with `<Suspense>`.

## 5. State machine originally embedded only in service private method

**Symptom:** Rubric/design review — transitions not independently testable or reusable; easy to bypass if another controller called Prisma directly.

**Root cause:** Business rules lived only inside `AppointmentService.assertStatusChange`.

**Fix:** Extracted `backend/src/domain/appointment-status.ts` as single owner; service delegates; unit + HTTP tests prove enforcement.

## Validation habit

For each AI suggestion that touches auth, money, or status: run tests, try one illegal path manually, then accept or reject with a note in `code-review.md` / this file.
