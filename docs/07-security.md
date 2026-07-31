# 07 — Security

## Authentication

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT access** (short-lived, default 15m) + **refresh** (default 7d)
- Refresh tokens stored in DB; rotated on refresh; revoked on logout
- Access tokens can be **blacklisted** on logout

## Authorization (RBAC)

Middleware: `authenticate` → `authorize(...roles)`.

- `SUPER_ADMIN` bypasses role checks
- Domain services additionally scope data (e.g. patients only see own appointments)

See [10 — Roles & Permissions](./10-roles-and-permissions.md).

## HTTP hardening

| Control | Library / approach |
|---------|-------------------|
| Helmet | Security headers |
| CORS | Allowlist via `CORS_ORIGIN` |
| Rate limiting | `express-rate-limit` |
| Body size | JSON limit 2mb |
| Input validation | Zod on request bodies |
| SQL injection | Prisma parameterized queries |
| XSS | React escaping + Helmet |

## Secrets handling

- Never commit `.env` / `.env.local`
- Commit only `.env.example` with placeholders
- JWT secrets must be ≥ 32 characters (enforced by env Zod schema)

## Audit

Sensitive actions write to `audit_logs` (login, CRUD, status change, payment).

## Recommended production checklist

- [ ] Rotate JWT secrets
- [ ] Set `CORS_ORIGIN` to exact frontend URL (no `*`)
- [ ] Serve API behind HTTPS
- [ ] Enable DB SSL
- [ ] Configure real SMTP for password reset
- [ ] Restrict upload MIME types / sizes
- [ ] Consider httpOnly cookie session instead of localStorage for XSS resilience
- [ ] Add WAF / reverse proxy rate limits
