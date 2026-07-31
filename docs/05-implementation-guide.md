# 05 — Implementation Guide (Backend)

## Folder map

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/env.ts
│   ├── controllers/
│   ├── middlewares/
│   ├── services/
│   ├── validators/schemas.ts
│   ├── routes/index.ts
│   ├── exceptions/AppError.ts
│   ├── responses/apiResponse.ts
│   ├── utils/
│   ├── types/
│   ├── prisma/client.ts
│   ├── app.ts                 # Express app (no listen)
│   └── server.ts              # boots listener
├── uploads/
└── tests/
```

## Conventions

1. **Validate early** — Zod schemas in controllers via `.parse(req.body)`
2. **Throw domain errors** — `NotFoundError`, `ConflictError`, `ForbiddenError`, …
3. **Never leak passwords** — sanitize user objects in auth service
4. **Scope by role** — appointment/patient lists filter by `doctorId` / `patientId`
5. **Soft delete** — set `deletedAt`; keep historical links

## Key algorithms

### Slot generation

1. Resolve weekday schedule for doctor
2. Expand `startTime`→`endTime` by `slotMins`
3. Remove booked slots (status not CANCELLED/REJECTED)
4. If date is today, remove past times
5. Skip entire day if holiday exists

### Booking

1. Resolve patient (token or body)
2. Confirm slot still free via `getAvailableSlots`
3. Assign `queueNumber` = count of active visits that day + 1
4. Notify doctor + patient
5. Write audit log

### Billing totals

```
subtotal = consultation + medicine + lab + other
total    = max(0, subtotal - discount + tax)
```

## Adding a new module (checklist)

1. Extend Prisma schema + `db push` / migrate
2. Add Zod schemas
3. Implement `*.service.ts`
4. Add controller handlers
5. Register routes with `authenticate` / `authorize`
6. Add unit tests under `backend/tests`
7. Document endpoint in `docs/04-api-reference.md`

## Scripts

```bash
npm run dev              # tsx watch
npm run build            # tsc → dist/
npm test                 # vitest
npm run test:coverage    # vitest + coverage
npx prisma db push
npx tsx prisma/seed.ts
```
