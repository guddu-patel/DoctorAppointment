# Reflection

## What went well

- Shipping a complete multi-role clinic app (book → queue → prescribe → bill) with a layered API.
- Separating Core vs Stretch kept scope honest (SMS/Stripe deferred).
- Extracting the appointment state machine made illegal transitions testable and reviewable.
- Documentation set now matches assessment lifecycle expectations (workflow, AC, debugging, prompts).

## What was hard

- Resisting “generate everything” prompts; scoped slices produced fewer bugs.
- Prisma nested-create ergonomics (connect vs scalar) wasted time until reproduced carefully.
- Git hygiene (cwd + auth) interrupted flow more than application code.

## How AI helped

- Fast scaffolding of Express/Next structure and Zod schemas.
- Drafting docs and test catalogs from the SRS.
- Proposing slot generation and billing math quickly.

## How AI hurt / needed challenge

- Early status logic was “role ifs” without a transition graph — I required a central module.
- Bulk git init in wrong folder — process failure, not model failure; fixed by verifying cwd.
- Would have happily put secrets in repo if `.gitignore` wasn’t enforced first.

## What I would do differently next time

1. Write AC + state machine table **before** UI dashboards.
2. Add HTTP integration tests in the same PR as the service change.
3. Commit in narrative slices (auth, appointments, billing, docs) from day one.

## Reuse

The Cursor workflow folder + `ai-prompts/` are reusable for the next full-stack assessment or team feature.
