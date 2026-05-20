# QuizAdda

A full-stack quiz portal: users browse categories, attempt timed quizzes, and see scored results. Administrators manage categories, quizzes, and questions through a dedicated dashboard.

| | |
|---|---|
| **Frontend** | Angular 16 + Angular Material, deployed to Vercel |
| **Backend** | Spring Boot 3.1, Java 17, JWT auth, deployed to Render |
| **Database** | PostgreSQL (Neon serverless) |
| **API docs** | OpenAPI 3 (Springdoc) — Swagger UI at `/swagger-ui.html` |

---

## Table of contents

- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Quick start (local dev)](#quick-start-local-dev)
- [Deployment](#deployment)
- [Features](#features)
- [Test credentials](#test-credentials)
- [Screenshots](#screenshots)

---

## Architecture

```
+--------------------+        HTTPS         +-------------------------+         JDBC + SSL         +-----------------+
|   Angular SPA      |  -----------------\  |   Spring Boot API       |  ------------------------\ |  Neon Postgres  |
|   (Vercel)         |   Bearer JWT      \\ |   (Render free dyno)    |   Connection pooled       \|  (us-east-2)    |
|                    |  =================\\>|                         |   ====================== >|                 |
|   - Angular 16     |                     |   - REST /api/v1/**     |                            |  - Tables auto-  |
|   - JWT in         |                     |   - JWT bearer auth      |                            |    migrated via |
|     localStorage   |                     |   - DTO validation       |                            |    Hibernate    |
|   - HttpInterceptor|                     |   - Global exception     |                            |  - ddl-auto=    |
|     adds Bearer    |                     |     handler              |                            |    update       |
+--------------------+                     +-------------------------+                             +-----------------+
```

**Request flow on a typical action (e.g. "load quizzes"):**

1. The Angular HTTP interceptor pulls the JWT from `localStorage` and stamps `Authorization: Bearer <token>` onto every request.
2. The browser hits the Render-hosted Spring Boot API (CORS-allowed origins are env-configured).
3. `JwtAuthenticationFilter` validates the token signature against the server secret, loads `UserDetails`, and populates Spring Security's `SecurityContext`.
4. The controller delegates to a service, which performs the business logic in a `@Transactional` boundary and returns a DTO.
5. Jackson serializes the DTO to JSON. If anything fails along the way, `GlobalExceptionHandler` produces a uniform `ApiError` JSON body.

## Repository layout

```
QuizAdda/
├── quizadda_client/          Angular 16 frontend  (deployed to Vercel)
│   └── README.md             Frontend setup, env config, deployment guide
│
├── quizadda_server/          Spring Boot 3 backend (deployed to Render)
│   ├── README.md             Backend architecture, env vars, API reference
│   └── .env.example          Template for required environment variables
│
└── README.md                 You are here
```

Each subproject has its own README with detailed setup, architecture, and operations notes.

## Quick start (local dev)

**Prerequisites:** Java 17, Node.js 18+, a free Neon Postgres database (https://neon.tech).

```powershell
# 1. Clone
git clone https://github.com/satishgupta07/QuizAdda.git
cd QuizAdda

# 2. Configure backend env vars
cp quizadda_server/.env.example quizadda_server/.env
# Edit .env: paste Neon connection string and generate a JWT_SECRET (>= 32 chars)

# 3. Run the backend (auto-creates tables and seeds USER/ADMIN roles in Neon)
cd quizadda_server
./mvnw spring-boot:run

# 4. In a second terminal, run the frontend
cd quizadda_client
npm install
npm start              # http://localhost:4200
```

The Angular dev server points at `http://localhost:9797` by default (see [environment.ts](quizadda_client/src/environments/environment.ts)). Browse to `http://localhost:9797/swagger-ui.html` to explore the API interactively.

> Detailed setup instructions live in each subproject's README:
> - [Backend setup](quizadda_server/README.md)
> - [Frontend setup](quizadda_client/README.md)

## Deployment

| Component | Service | Free tier notes |
|---|---|---|
| Frontend | **Vercel** | Auto-builds on `git push`. Static hosting, no cold starts. |
| Backend | **Render** | Free web service sleeps after 15 min idle (~30–60 s cold start). |
| Database | **Neon** | 0.5 GB storage, scales to zero when idle (<1 s warm-up). |

Production env vars (set on Render):

| Variable | Example | Purpose |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-...neon.tech/neondb?sslmode=require` | Neon JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` | Neon username |
| `SPRING_DATASOURCE_PASSWORD` | *(from Neon)* | Neon password |
| `JWT_SECRET` | *(>= 32 chars random)* | HS256 signing key |
| `JWT_EXPIRATION_MS` | `18000000` | Token lifetime (5 hours default) |
| `CORS_ALLOWED_ORIGINS` | `https://quizadda.vercel.app` | Comma-separated allowed origins |

After backend is deployed, update [environment.prod.ts](quizadda_client/src/environments/environment.prod.ts) with the Render URL and push — Vercel rebuilds automatically.

## Features

### User
- Register / log in (JWT bearer auth)
- Browse quiz categories and active quizzes
- Take a randomized quiz with countdown timer
- See marks, correct answers, and attempted count after submission

### Admin
- Manage categories (CRUD)
- Manage quizzes — title, description, category, max marks, active/inactive
- Manage questions — content, four options, correct answer

### Behind the scenes
- Server-side answer-key evaluation (clients cannot tamper with scoring)
- Bean Validation on every write endpoint
- Centralized JSON error responses with field-level violations
- Username enumeration prevention on login

## Test credentials

After registering or seeding manually, the dev fixtures use:

| Role | Username | Password |
|---|---|---|
| USER  | `user`  | `user`  |
| ADMIN | `admin` | `admin` |

`DataLoader` only seeds the **roles**; users must be registered explicitly via `POST /api/v1/users`.

## Screenshots

| Login | Registration |
|---|---|
| ![login](https://res.cloudinary.com/satish07/image/upload/v1704128491/QuizAdda/pbhnqsgh44jauxubevld.png) | ![register](https://res.cloudinary.com/satish07/image/upload/v1704128881/QuizAdda/fdpinegwzpl9fgqihnmw.png) |

| User Dashboard | Quiz instructions |
|---|---|
| ![dashboard](https://res.cloudinary.com/satish07/image/upload/v1704129092/QuizAdda/bdqgypixsnd9cwgxckjc.png) | ![instructions](https://res.cloudinary.com/satish07/image/upload/v1704129201/QuizAdda/fhdvrjayrrbp4ro7su48.png) |

| Attempting a quiz | Result |
|---|---|
| ![attempt](https://res.cloudinary.com/satish07/image/upload/v1704129381/QuizAdda/sw631kek259qsw1lxecj.png) | ![result](https://res.cloudinary.com/satish07/image/upload/v1704129572/QuizAdda/pc0gbyhmbshkx1qjpa1k.png) |

| Admin Dashboard | All categories |
|---|---|
| ![admin](https://res.cloudinary.com/satish07/image/upload/v1704130993/QuizAdda/xiic0cikjpr0nsqydayt.png) | ![categories](https://res.cloudinary.com/satish07/image/upload/v1704131099/QuizAdda/mbtqep0thancgacmdn7t.png) |

| Add category | All quizzes |
|---|---|
| ![add-cat](https://res.cloudinary.com/satish07/image/upload/v1704131176/QuizAdda/w37qifjj58yssqwrjttr.png) | ![quizzes](https://res.cloudinary.com/satish07/image/upload/v1704131756/QuizAdda/gzx1jfedaksknu9mdtux.png) |

| Add quiz | Questions of a quiz |
|---|---|
| ![add-quiz](https://res.cloudinary.com/satish07/image/upload/v1704131788/QuizAdda/thuhchkq8loii1dbpddi.png) | ![questions](https://res.cloudinary.com/satish07/image/upload/v1704131816/QuizAdda/ev7al1xwrbsieyjjaayc.png) |

| Add question | Swagger UI |
|---|---|
| ![add-question](https://res.cloudinary.com/satish07/image/upload/v1704131841/QuizAdda/lkxmcrlceysuuxolgwq5.png) | ![swagger](https://res.cloudinary.com/satish07/image/upload/v1705389251/QuizAdda/ilhtmehwxrvm75owkszs.jpg) |
