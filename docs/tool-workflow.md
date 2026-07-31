# Tool Workflow (Part A)

## Primary AI tool used

**Cursor** (Agent + Chat), with durable context under `tool-specific/cursor-workflow/` and prompt templates in `ai-prompts/`.

## How I provide project context to the tool

1. Keep durable context in-repo (`tool-specific/cursor-workflow/project-context.md`, `spec.md`, `cursor-rules-or-instructions.md`).
2. Point the agent at concrete paths (e.g. `@backend/src/domain/appointment-status.ts`) instead of vague “fix appointments”.
3. Paste Core vs Stretch boundaries before large generation asks.
4. Prefer scoped asks (one module / one acceptance criterion) over “build everything”.

## How I use AI for requirement analysis

- Restate the clinic SRS in my own words in `docs/requirements-analysis.md`.
- Separate **Core** (must ship) from **Stretch** (auth depth, notifications, billing, queue, Vitest).
- Challenge edge cases: double-booking, illegal status jumps, patient confirming own visit.
- Convert analysis into checkboxes in `docs/acceptance-criteria.md` before coding.

## How I use AI for planning and design

- Phased plan: DB/Prisma → Auth → Appointments/slots → Role UIs → Billing/Rx → Tests → Docs.
- Design the appointment lifecycle as a **single owned module** (`appointment-status.ts`).
- Align API envelopes and Zod schemas before UI wiring.

## How I use AI for code generation

- Scaffold layered backend: routes → controllers → services → Prisma.
- Generate one feature slice at a time (auth → doctors/slots → appointments → prescriptions → bills).
- Require matching existing patterns (no new frameworks unless asked).

## How I validate AI-generated code

1. Diff against acceptance criteria (especially status transitions and RBAC).
2. Run `npm test` / `npm run test:coverage` in backend and frontend.
3. Manually exercise illegal transitions (patient → CONFIRMED) and confirm API rejects.
4. **Reject** any suggestion that bypasses `assertAppointmentStatusChange` or puts rules only in the UI.

## How I use AI for testing

- Unit tests for pure transition table (`appointment-status.test.ts`).
- HTTP integration tests proving valid paths persist and illegal ones return 400/403 (`appointment-http.test.ts`).
- Capture results in `docs/test-results.md`.

## How I use AI for debugging

- Provide symptom + stack/log snippet (never live secrets).
- Ask for root-cause hypotheses, then verify myself.
- Document real incidents in `docs/debugging-notes.md` (Prisma connect vs scalar FK, git init cwd, seed holidays/slots).

## How I use AI for code review

- Run a strict AC-based review prompt (`ai-prompts/code-review.md`).
- Keep accepted vs rejected suggestions in `docs/code-review.md`.

## What information I avoid sharing unnecessarily with AI tools

- Production JWT secrets / real DB passwords
- Patient PHI from real clinics
- Private keys / OAuth credentials
- Entire production `.env` files

Demo seed passwords in README are intentional and non-production.

## How I would reuse this workflow in a real project

1. Copy `tool-specific/cursor-workflow/` and adapt `spec.md` / rules.
2. Keep `ai-prompts/` for planning → review.
3. Enforce “business rules in domain/services + tests for illegal transitions” as a team rule.
4. Require honest lifecycle artifacts for any AI-assisted feature delivery.
