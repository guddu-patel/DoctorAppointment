# 08 — Setup & Deployment

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## Local setup

### 1. Clone & install

```bash
git clone https://github.com/guddu-patel/DoctorAppointment.git
cd DoctorAppointment

cd backend && npm install
cd ../frontend && npm install
```

### 2. Database

Create DB or let Prisma create it:

```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/doctor_appointment?schema=public
```

Copy env:

```bash
cp backend/.env.example backend/.env
# edit DATABASE_URL + JWT secrets
```

```bash
cd backend
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Frontend env

```bash
cp frontend/.env.example frontend/.env.local
```

### 4. Run

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

- Frontend: http://localhost:3000  
- API: http://localhost:4000/api/v1/health  

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing (≥32 chars) |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token TTL |
| `CORS_ORIGIN` | Allowed frontend origin |
| `PORT` | Default `4000` |
| `SMTP_*` | Optional email |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base including `/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | Brand label |

## Deployment suggestions

| Component | Suggested host |
|-----------|----------------|
| Frontend | Vercel |
| Backend | Render / Railway / AWS ECS |
| Database | Managed PostgreSQL (Neon, RDS, Railway) |

### Backend production

```bash
npm run build
npm start
# run migrations: npx prisma migrate deploy
```

### Frontend production

```bash
npm run build
npm start
# or deploy to Vercel with NEXT_PUBLIC_API_URL set
```

## Smoke checks after deploy

1. `GET /api/v1/health` → 200  
2. Login with seed admin  
3. List doctors from public page  
4. Book appointment as patient  
5. Confirm / prescribe as doctor  
6. Create bill as staff  
