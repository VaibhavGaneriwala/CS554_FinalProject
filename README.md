## FitTracker (CS554 Final Project)

FitTracker is a full‑stack fitness + nutrition tracker with workouts, meals, progress logs, and a simple social feed. It’s built as a React frontend backed by an Express + MongoDB API, with Redis caching and MinIO for image storage.

### What you can do

- **Auth + profile**: register/login, update profile details, upload a profile picture
- **Workouts**: create/edit/delete workouts and exercises
- **Meals**: log meals and upload meal photos
- **Progress**: track progress entries and upload progress photos
- **Feed**: view and interact with posts (likes + comments)

### Tech stack

- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Node/Express + TypeScript, Mongoose (MongoDB), Redis, MinIO
- **Infra**: Docker Compose (MongoDB + Redis + MinIO + backend + frontend)

---

## Quick start (recommended): Docker Compose

### Prereqs

- Docker Desktop (or Docker Engine + Compose)

### Start everything

This project is designed to run via Docker Compose (MongoDB + Redis + MinIO + backend + frontend).

From the repo root:

```bash
docker compose up --build
```

Then open:

- **Frontend**: `http://localhost:3001`
- **Backend health**: `http://localhost:3000/health`
- **MinIO Console**: `http://localhost:9001`

### Login (seeded data)

On the **first run**, the database is automatically seeded with sample data.

- **Email**: `john@example.com`
- **Password**: `PasswordPassword@123`

### Stop / restart

- Stop containers: press `Ctrl+C` in the terminal running `docker compose up`
- Stop containers (detached mode): `docker compose down`

---

## Port Configuration (Docker Compose)

This project uses Docker Compose with configurable ports. If you have local services running on the default ports, you can override them by creating a `.env` file in the root directory.

### Default Ports

- **MongoDB**: 27017
- **Redis**: 6379
- **MinIO API**: 9000
- **MinIO Console**: 9001
- **Backend API**: 3000
- **Frontend**: 3001

### Customizing Ports

Create a `.env` file in the root directory with your custom ports:

```env
MONGODB_PORT=27018
REDIS_PORT=6380
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003
BACKEND_PORT=3002
FRONTEND_PORT=3003
CORS_ORIGIN=http://localhost:3003
REACT_APP_API_URL=http://localhost:3002/api
```

**Note**: If you change `BACKEND_PORT` or `FRONTEND_PORT`, make sure to also update `CORS_ORIGIN` and `REACT_APP_API_URL` accordingly. If you change the backend port, also set `PUBLIC_BACKEND_BASE_URL` (used for generating public file URLs).

### Backend `.env` (when running backend outside Docker)

Separately from Docker Compose port overrides, you may have a `backend/.env` for the backend runtime config when you run the backend locally (e.g., `npm run dev` inside `backend/`).

For **Docker Compose**, you typically do **not** need `backend/.env` (Compose supplies env vars).

For **local backend dev**, the backend expects at minimum:

- `MONGO_URI` (required)
- `REDIS_HOST` (required; defaults to empty string)
- `MINIO_ENDPOINT` (required if you use uploads)
- `CORS_ORIGIN` (should match where the frontend is running)

See the “Running locally” section below for a copy/paste `backend/.env` example.

---

## Seed data (important)

The `docker-compose.yml` includes a dedicated **one-shot** `seed` service that runs `backend/seed.js` before the backend starts.

### What happens on `docker compose up`

- **If the database is empty**: `seed` inserts sample data, then exits successfully.
- **If the database already has users**: `seed` **skips** (so your data is preserved).

### Seeded accounts

The seed script creates several users (e.g. `john@example.com`, `jane@example.com`, etc.).

- **Password for all seeded users**: `PasswordPassword@123`

### Force wipe + reseed (optional)

If you want to wipe the DB and reseed from scratch:

```bash
docker compose run --rm -e SEED_FORCE=true seed
```

### Reset everything (nuclear option)

This deletes the Mongo/Redis/MinIO volumes (all stored data), then reseeds on next `up`:

```bash
docker compose down -v
docker compose up --build
```

---

## Password requirements

Registration/login enforces a strong password policy:

- **At least 16 characters**
- Must include **uppercase**, **lowercase**, **number**, and a **symbol**

---

## File uploads (images)

Uploads are restricted to images:

- **Allowed**: JPEG/JPG, PNG, WEBP
- **Max size**: 5 MB per file
- Meal/progress uploads allow **up to 5 images** per request

Images are stored in MinIO and served to the browser via the backend under:

- `GET /api/files/:objectName`

---

## Running locally (dev mode)

If you’re not comfortable installing MongoDB/Redis/MinIO locally, the easiest “local dev” setup is:

- Run **MongoDB + Redis + MinIO** in Docker
- Run **backend + frontend** on your machine

### 1) Start dependencies (Docker)

From the repo root:

```bash
docker compose up -d mongodb redis minio
```

### 2) Backend (local)

Create `backend/.env` (example):

```env
# Core
NODE_ENV=development
PORT=3000

# Mongo
MONGO_URI=mongodb://localhost:27017/cs554-finalproject

# Redis (required - redisHost defaults to empty string)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=cs554-finalproject

# Used for building public file URLs served to the browser
PUBLIC_BACKEND_BASE_URL=http://localhost:3000

# Auth (safe defaults exist, but you can override)
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=7d

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:3001
```

Then run:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Notes:

- `npm run seed` is **idempotent**. If you need to force a reseed locally: `SEED_FORCE=true npm run seed`

### 3) Frontend (local)

```bash
cd frontend
npm install
npm start
```

Make sure the frontend points to the backend API:

- Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

Then open the URL that `npm start` prints (often `http://localhost:3001` if the backend is already using 3000).

---

## Troubleshooting

- **Ports already in use**: change the ports in the root `.env` (Docker) or update `PORT` / `REACT_APP_API_URL` (local).
- **“Seed skipped…” but you want fresh data**:
  - Docker: `docker compose run --rm -e SEED_FORCE=true seed`
  - Local: `cd backend && SEED_FORCE=true npm run seed`
- **Blank/failed image uploads**: ensure MinIO is running and `MINIO_*` env vars match where it’s reachable.

---
