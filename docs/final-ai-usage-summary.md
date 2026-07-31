# Final AI Usage Summary

| Item | Detail |
|------|--------|
| Primary tool | Cursor Agent + Chat |
| Languages | TypeScript (Express + Next.js) |
| Where AI helped most | Scaffolding, docs drafting, test generation, refactoring status rules into domain module |
| Where human ownership mattered most | Rejecting UI-only enforcement, Prisma connect fix, git root hygiene, Core vs Stretch honesty |
| Artifacts proving workflow | `tool-workflow.md`, `prompt-history.md`, `debugging-notes.md`, `code-review.md`, `chat-history.md` |
| Secrets policy | No production secrets in prompts or git; `.env` ignored |

AI was used as an accelerator with mandatory validation (`npm test`, illegal-path checks, AC review). Suggestions that bypassed the appointment state machine or weakened security were rejected.
