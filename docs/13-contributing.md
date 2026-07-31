# 13 — Contributing

## Branching

- `main` — stable
- Feature: `feature/<short-name>`
- Fix: `fix/<short-name>`
- Docs: `docs/<short-name>`

## Commit style

Prefer concise why-focused messages:

```
Add appointment slot conflict check to prevent double booking
```

## PR checklist

- [ ] Types pass (`tsc` / Next build)
- [ ] Lint clean where touched
- [ ] Unit tests added/updated for logic changes
- [ ] API / docs updated if contracts change
- [ ] No secrets in commit (`.env` ignored)
- [ ] Manual smoke for affected role dashboard

## Code style

- Match existing naming and folder patterns
- Prefer small, reviewable diffs
- Do not introduce new frameworks without discussion

## Documentation

Update the relevant file under `docs/` when behavior, schema, or API changes. Keep `docs/README.md` index accurate.
