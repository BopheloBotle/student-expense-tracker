# Student Expense Tracker (Secure Full-Stack)

Monorepo:
- `backend/` Spring Boot (JWT auth, roles, validation, rate limiting)
- `frontend/` React (dashboard + CRUD UI)
- `docker-compose.yml` PostgreSQL for local dev

## Prereqs
- Java 21+
- Node.js 18+
- Docker Desktop

## Quickstart (local dev)
1) Start PostgreSQL:

```bash
docker compose up -d
```

2) Run backend:

```bash
cd backend
./mvnw spring-boot:run
```

Backend listens on **`http://localhost:8081`** (see `server.port` in `backend/src/main/resources/application.properties`). The Vite dev server proxies `/api` to that port.

3) Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`.

## API (high-level)
- `POST /api/auth/register` (creates USER)
- `POST /api/auth/login` (returns JWT)
- `GET /api/users/me`
- `CRUD /api/expenses`
- `CRUD /api/categories`
- `GET /api/dashboard/summary`

## Security features included
- BCrypt password hashing
- JWT authentication + role-based authorization (ADMIN vs USER)
- Input validation (Bean Validation) + safe ORM queries (JPA)
- Rate limiting for auth endpoints

