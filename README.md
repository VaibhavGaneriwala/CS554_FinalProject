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
docker-compose up --build
```

Then open:

- **Frontend**: `http://localhost:3001`
- **Backend health**: `http://localhost:3000/health`
- **MinIO Console**: `http://localhost:9001`

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

**Note**: If you change `BACKEND_PORT` or `FRONTEND_PORT`, make sure to also update `CORS_ORIGIN` and `REACT_APP_API_URL` accordingly.

### Backend `.env` (when running backend outside Docker)

Separately from Docker Compose port overrides, you may have a `backend/.env` for the backend runtime config when you run the backend locally (e.g., `npm run dev` inside `backend/`).

Your current `backend/.env` includes keys like `PORT`, `REDIS_HOST`, `MINIO_*`, and `CORS_ORIGIN`. Do **not** commit secrets (JWT/third‑party API keys). Here’s a safe template matching your file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# (In this repo the backend expects MONGODB_URI in Docker; use whichever your code is wired to.)
MONGODB_URI=mongodb://localhost:27017/cs554-finalproject

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=cs554-finalproject

# External API Keys
EDAMAM_APP_ID=<your_edamam_app_id>
EDAMAM_APP_KEY=<your_edamam_app_key>

# CORS
CORS_ORIGIN=http://localhost:3001
```

If you change the backend `PORT`, make sure your frontend `REACT_APP_API_URL` points to the same port.

---

## Seed data (important)

The backend container runs the seed script on startup (see `backend/docker-entrypoint.sh`). That means:

- **Every time the backend container starts, the DB is reseeded** (existing users/posts/etc are cleared and recreated).
- If you restart containers, your previously created users/data may disappear.

### Seeded accounts

The seed script creates several users (e.g. `john@example.com`, `jane@example.com`, etc.).

- **Password for all seeded users**: `PasswordPassword@123`

### Stop reseeding on every container start (recommended once you’re developing)

Edit `backend/docker-entrypoint.sh` and remove (or comment out) the seed step:

```sh
npm run seed
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

## Running locally (without Docker)

You’ll need MongoDB, Redis, and MinIO running somewhere reachable, then:

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Make sure `REACT_APP_API_URL` points at the backend (example: `http://localhost:3000/api`).

---
