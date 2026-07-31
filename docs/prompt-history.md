# Prompt History

Structured prompts used with Cursor. Each entry notes **Accept / Change / Reject** rationale.

## P1 — Planning / context

**Prompt intent:** Restate SRS; split Core vs Stretch; list edge cases.  
**Outcome:** **Accept (edited)** → `requirements-analysis.md`  
**Change:** Soft-delete and admin override called out explicitly as assumptions.

## P2 — Design state machine

**Prompt intent:** Centralize appointment transitions; forbid UI-only enforcement.  
**Outcome:** **Accept** → `backend/src/domain/appointment-status.ts`  
**Reject alternate:** “Just check roles in the controller” — insufficient graph checks.

## P3 — Implementation booking + RBAC

**Prompt intent:** Implement slot booking with conflict detection and role-scoped lists.  
**Outcome:** **Accept (changed)** — nested Prisma `connect` after seed failure.  
**Accountability:** Documented in `debugging-notes.md` #1.

## P4 — Testing illegal transitions

**Prompt intent:** HTTP tests for patient confirm forbidden + illegal COMPLETED jump.  
**Outcome:** **Accept** → `appointment-http.test.ts` + unit table tests.

## P5 — Documentation lifecycle

**Prompt intent:** Mirror ticket assessment artifacts (tool-workflow, AC, reflection).  
**Outcome:** **Accept** → docs set under `docs/` + `ai-prompts/` + `tool-specific/cursor-workflow/`.

## P6 — Git monorepo push

**Prompt intent:** Init root repo with ignore rules; push to GitHub.  
**Outcome:** **Change** — fix nested `backend/.git`; user completed auth push.  
**Reject:** Committing `.env`.

## Linkage

| Prompt | Primary evidence |
|--------|------------------|
| P1 | `docs/requirements-analysis.md` |
| P2 | `backend/src/domain/appointment-status.ts` |
| P3 | `backend/src/services/appointment.service.ts` |
| P4 | `backend/tests/appointment-*.test.ts` |
| P5 | `docs/tool-workflow.md`, `docs/acceptance-criteria.md` |
| P6 | `docs/debugging-notes.md`, `docs/chat-history.md` |
