# QuizAdda — Backend (Spring Boot)

REST API for the QuizAdda quiz portal. Stateless JWT auth, layered architecture with DTOs and Bean Validation, PostgreSQL persistence, and OpenAPI documentation out of the box.

> **Looking for the project overview?** See the [root README](../README.md).

---

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Package layout](#package-layout)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [API reference](#api-reference)
- [Authentication flow](#authentication-flow)
- [Error responses](#error-responses)
- [Database & migrations](#database--migrations)
- [Deployment (Render)](#deployment-render)
- [Conventions](#conventions)

---

## Tech stack

| Layer | Library / Tool | Version |
|---|---|---|
| Language | Java | 17 |
| Framework | Spring Boot | 3.1.4 |
| Web | Spring Web (Tomcat) | – |
| Security | Spring Security 6 + JWT (jjwt 0.12.6) | – |
| Persistence | Spring Data JPA + Hibernate 6 | – |
| Validation | Spring Boot starter-validation (Hibernate Validator) | – |
| Database | PostgreSQL (driver 42.x) | – |
| Docs | Springdoc OpenAPI | 2.3.0 |
| Build | Maven (Maven Wrapper bundled) | 3.x |
| Convenience | Lombok | – |

## Architecture

A standard layered architecture — each layer has one job and depends only on the layer below it:

```
+------------------+    HTTP + JSON
|   Controller     |  <----------------  Client (Angular)
+------------------+
        |  DTOs (records) + Bean Validation
        v
+------------------+
|     Service      |  <-- @Transactional boundary; throws domain exceptions
+------------------+
        |  JPA entities
        v
+------------------+
|   Repository     |  <-- Spring Data JPA interface
+------------------+
        |  SQL (Hibernate)
        v
+------------------+
|   PostgreSQL     |
+------------------+
```

### Cross-cutting concerns

- **`GlobalExceptionHandler`** (`@RestControllerAdvice`) translates every exception into an `ApiError` JSON body with consistent shape.
- **`JwtAuthenticationFilter`** runs once per request, extracts the bearer token, and populates the `SecurityContext` so controllers see the authenticated principal.
- **`SecurityConfig`** declares which routes need auth and wires the CORS configuration.
- **`DataLoader`** (`CommandLineRunner`) seeds the `USER` and `ADMIN` roles on startup so a fresh database boots into a usable state.

## Package layout

```
com.satishgupta.quizadda_server/
│
├── QuizaddaServerApplication.java     -- Spring Boot entry point
│
├── config/                            -- App-wide configuration
│   ├── DataLoader.java                  Seeds USER/ADMIN roles on startup
│   ├── JwtAuthenticationEntryPoint.java Renders 401 JSON for unauthenticated requests
│   ├── JwtAuthenticationFilter.java     Per-request JWT validation filter
│   ├── JwtUtils.java                    Issues + verifies HS256 tokens
│   ├── SecurityConfig.java              Spring Security + CORS wiring
│   └── SwaggerConfig.java               OpenAPI metadata
│
├── controllers/                       -- HTTP entry points (thin)
│   ├── AuthController.java              POST /api/v1/auth/login, GET /me
│   ├── CategoryController.java          /api/v1/categories
│   ├── QuizController.java              /api/v1/quizzes (+ /evaluate)
│   ├── QuestionController.java          /api/v1/questions
│   └── UserController.java              /api/v1/users (registration)
│
├── dto/                               -- Request/response payloads (Java records)
│   ├── ApiError.java                    Uniform error response
│   ├── auth/                            LoginRequest, LoginResponse
│   ├── category/                        CategoryRequest, CategoryResponse
│   ├── question/                        QuestionRequest, QuestionResponse
│   ├── quiz/                            QuizRequest/Response, EvaluateQuiz*
│   └── user/                            RegisterUserRequest, UserResponse
│
├── exceptions/                        -- Domain exceptions + handler
│   ├── DuplicateResourceException.java    -> HTTP 409
│   ├── ResourceNotFoundException.java     -> HTTP 404
│   └── GlobalExceptionHandler.java        Maps exceptions to ApiError JSON
│
├── mappers/                           -- Entity <-> DTO mapping (static)
│   ├── CategoryMapper.java
│   ├── QuestionMapper.java              (has toResponse + toUserResponse — strips answer)
│   ├── QuizMapper.java
│   └── UserMapper.java
│
├── models/                            -- JPA entities (the schema lives here)
│   ├── Authority.java
│   ├── Role.java
│   ├── User.java
│   ├── UserRole.java
│   └── quizPortal/
│       ├── Category.java
│       ├── Question.java
│       └── Quiz.java
│
├── repositories/                      -- Spring Data JPA interfaces
│   ├── CategoryRepository.java
│   ├── QuestionRepository.java
│   ├── QuizRepository.java
│   ├── RoleRepository.java              (findByRoleName)
│   └── UserRepository.java              (findByUsername, existsByUsername, existsByEmail)
│
└── services/                          -- Business logic
    ├── CategoryService.java             Interface
    ├── QuestionService.java
    ├── QuizService.java                 Includes evaluateQuiz (server-side scoring)
    ├── UserService.java
    └── impl/
        ├── CategoryServiceImpl.java
        ├── QuestionServiceImpl.java
        ├── QuizServiceImpl.java
        ├── UserDetailsServiceImpl.java  Spring Security adapter
        └── UserServiceImpl.java
```

## Environment variables

All secrets are externalized; the app refuses to start if required vars are missing. See [`.env.example`](.env.example) for the full template.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | no | `9797` | HTTP listen port (cloud providers override) |
| `SPRING_DATASOURCE_URL` | **yes** | — | JDBC URL, e.g. `jdbc:postgresql://...neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | **yes** | — | DB user |
| `SPRING_DATASOURCE_PASSWORD` | **yes** | — | DB password |
| `JWT_SECRET` | **yes** | — | HS256 signing key — must be ≥ 32 UTF-8 bytes |
| `JWT_EXPIRATION_MS` | no | `18000000` (5 h) | Access-token lifetime in ms |
| `CORS_ALLOWED_ORIGINS` | no | `http://localhost:4200` | Comma-separated allowlist |

### Generating a JWT secret

```powershell
# 64-character random alphanumeric string
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## Running locally

```powershell
# 1. Copy the env template and fill in real values
cp .env.example .env
# Edit .env: paste Neon credentials and a JWT_SECRET

# 2. Load env vars (PowerShell)
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { Set-Item "env:$($matches[1])" $matches[2] }
}

# 3. Build and run
./mvnw spring-boot:run
```

On first boot:

- Hibernate creates the schema (`ddl-auto=update`)
- `DataLoader` seeds the `USER` and `ADMIN` roles
- Swagger UI is available at http://localhost:9797/swagger-ui.html

### From IntelliJ

Open the project, then on the `QuizaddaServerApplication` run configuration paste the contents of `.env` into **Environment variables** (one per line).

## API reference

All endpoints are prefixed with `/api/v1`. All write endpoints validate the request body and return JSON. All protected endpoints require `Authorization: Bearer <jwt>`.

### Auth

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | no | `LoginRequest` | `LoginResponse` `{ token, user }` |
| `GET`  | `/api/v1/auth/me` | yes | – | `UserResponse` |

### Users

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `POST`   | `/api/v1/users` | no | `RegisterUserRequest` | `201 UserResponse` |
| `GET`    | `/api/v1/users/{username}` | yes | – | `UserResponse` |
| `DELETE` | `/api/v1/users/{userId}` | yes | – | `204` |

### Categories

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `GET`    | `/api/v1/categories` | yes | – | `List<CategoryResponse>` |
| `GET`    | `/api/v1/categories/{id}` | yes | – | `CategoryResponse` |
| `POST`   | `/api/v1/categories` | yes | `CategoryRequest` | `201 CategoryResponse` |
| `PUT`    | `/api/v1/categories/{id}` | yes | `CategoryRequest` | `CategoryResponse` |
| `DELETE` | `/api/v1/categories/{id}` | yes | – | `204` |

### Quizzes

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `GET`    | `/api/v1/quizzes` | yes | – | `List<QuizResponse>` |
| `GET`    | `/api/v1/quizzes?categoryId={id}` | yes | – | `List<QuizResponse>` |
| `GET`    | `/api/v1/quizzes/active` | yes | – | `List<QuizResponse>` |
| `GET`    | `/api/v1/quizzes/active?categoryId={id}` | yes | – | `List<QuizResponse>` |
| `GET`    | `/api/v1/quizzes/{id}` | yes | – | `QuizResponse` |
| `POST`   | `/api/v1/quizzes` | yes | `QuizRequest` | `201 QuizResponse` |
| `PUT`    | `/api/v1/quizzes/{id}` | yes | `QuizRequest` | `QuizResponse` |
| `DELETE` | `/api/v1/quizzes/{id}` | yes | – | `204` |
| `POST`   | `/api/v1/quizzes/{id}/evaluate` | yes | `EvaluateQuizRequest` | `EvaluateQuizResponse` |

### Questions

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| `GET`    | `/api/v1/questions` | yes | – | `List<QuestionResponse>` |
| `GET`    | `/api/v1/questions?quizId={id}` | yes | – | Admin view (includes answer) |
| `GET`    | `/api/v1/questions/take?quizId={id}` | yes | – | User view (random subset, answer omitted) |
| `GET`    | `/api/v1/questions/{id}` | yes | – | `QuestionResponse` |
| `POST`   | `/api/v1/questions` | yes | `QuestionRequest` | `201 QuestionResponse` |
| `PUT`    | `/api/v1/questions/{id}` | yes | `QuestionRequest` | `QuestionResponse` |
| `DELETE` | `/api/v1/questions/{id}` | yes | – | `204` |

### Interactive docs

- Swagger UI: `http://localhost:9797/swagger-ui.html`
- OpenAPI JSON: `http://localhost:9797/v3/api-docs`

## Authentication flow

1. Client posts credentials to `POST /api/v1/auth/login`.
2. `AuthController` delegates to `AuthenticationManager.authenticate(...)`, which loads the user via `UserDetailsServiceImpl` and matches the BCrypt password hash.
3. On success, `JwtUtils.generateToken(...)` issues an HS256 token signed with `JWT_SECRET`, with `subject = username` and `expiration = now + JWT_EXPIRATION_MS`.
4. Server returns `{ token, user }` (`LoginResponse`). Client stores the token in `localStorage` and sends it as `Authorization: Bearer <token>` on every subsequent request.
5. On each protected request, `JwtAuthenticationFilter` verifies the signature, loads the user, and sets the `SecurityContext`.
6. If verification fails (expired/malformed/invalid signature), the filter leaves the `SecurityContext` empty and `JwtAuthenticationEntryPoint` returns a `401` `ApiError` JSON.

> **Security note** — Login responses never distinguish between "user not found" and "wrong password" to prevent username enumeration. JWT tokens are never logged.

## Error responses

Every error is rendered through `GlobalExceptionHandler` as:

```json
{
  "timestamp": "2026-05-20T11:30:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "Quiz not found with id : '42'",
  "path": "/api/v1/quizzes/42"
}
```

Validation failures include field-level details:

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/users",
  "violations": [
    { "field": "username", "message": "Username is required" },
    { "field": "email",    "message": "Email must be valid" }
  ]
}
```

### Status code mapping

| Exception | HTTP |
|---|---|
| `ResourceNotFoundException` | 404 |
| `DuplicateResourceException` | 409 |
| `MethodArgumentNotValidException` | 400 (with `violations`) |
| `IllegalArgumentException` | 400 |
| `BadCredentialsException`, `UsernameNotFoundException` | 401 |
| Anything else | 500 (generic message; stack trace logged) |

## Database & migrations

Hibernate manages schema with `spring.jpa.hibernate.ddl-auto=update`. This is fine for early development — new columns/tables are added automatically — but **does not handle destructive changes** (renames, type changes). Plan to switch to Flyway or Liquibase before production data matters.

### Entity overview

```
+---------+    1..N   +-----------+    1..N    +-----------+    1..N    +-----------+
|  User   | <-------- | UserRole  | --------> |   Role    |             | Category  |
+---------+           +-----------+           +-----------+             +-----------+
                                                                              |
                                                                          1..N|
                                                                              v
                                                                        +-----------+      1..N      +-----------+
                                                                        |   Quiz    | -------------> | Question  |
                                                                        +-----------+                +-----------+
```

- `User` ↔ `Role` via `UserRole` (so role metadata can grow without an extra migration)
- `Category` ↛ `Quiz` ↛ `Question` form a strict containment hierarchy with `orphanRemoval = true`
- `User.password` is BCrypt-hashed and annotated `@JsonIgnore`
- `Question.answer` is **never** sent to a quiz-taker (stripped by `QuestionMapper.toUserResponse`)

## Deployment (Render)

Render's native runtimes don't cover Java, so we ship as a Docker container. The repo includes:

- **[Dockerfile](Dockerfile)** — multi-stage build (JDK build → JRE runtime, ~150 MB final image) that runs as an unprivileged user
- **[.dockerignore](.dockerignore)** — keeps `target/`, IDE files, uploads, and git metadata out of the build context

### One-time setup (Render dashboard)

1. **Push the repo to GitHub.**
2. In the Render dashboard → **New → Web Service** → select your repo.
3. Configure the service:
   - **Runtime**: Docker
   - **Root directory**: `quizadda_server`
   - **Dockerfile path**: `./Dockerfile`
   - **Plan**: Free
   - **Health check path**: `/api/v1/health`
4. Under **Environment variables**, add the variables listed below. Mark `JWT_SECRET` and the DB password as **Secret** so they're masked in the UI.
5. Click **Create Web Service**. First deploy triggers Hibernate schema creation in Neon and `DataLoader` seeds the `USER`/`ADMIN` roles.

### Required environment variables on Render

| Variable | Notes |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://...neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Neon username (typically `neondb_owner`) |
| `SPRING_DATASOURCE_PASSWORD` | Neon password — mark as Secret |
| `JWT_SECRET` | ≥ 32 characters — mark as Secret |
| `JWT_EXPIRATION_MS` | Optional; defaults to 18_000_000 (5 h) |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL, e.g. `https://quizadda.vercel.app` |
| `APP_FRONTEND_PASSWORD_RESET_URL` | `https://<your-vercel>/reset-password` |
| `APP_FRONTEND_EMAIL_VERIFY_URL` | `https://<your-vercel>/verify-email` |

`PORT` is injected automatically by Render — the app reads it from `${PORT:9797}` in [application.properties](src/main/resources/application.properties).

### Health check

Render polls `/api/v1/health` (configured in the service's Health Check Path) to detect a healthy boot and to gate zero-downtime deploys. The frontend's BootGate splash uses the same endpoint to detect cold starts.

### Watch out for

- **Free dyno sleeps after 15 min idle** — the first request after sleep takes 30–60 s while Spring Boot boots. The frontend BootGate splash handles this gracefully. To avoid sleep entirely, ping `/api/v1/health` every ~10 min from an external uptime monitor (UptimeRobot's free tier works) — but you'll burn through your monthly free hours faster.
- **Ephemeral filesystem** — Render's free tier doesn't include persistent disks. Anything written to `./uploads/` (question images) is lost on every dyno restart. For real persistence, attach a paid disk, or swap `FileStorageService` for Cloudinary/S3.
- **JVM memory** — the Dockerfile sets `-XX:MaxRAMPercentage=75` so the JVM right-sizes its heap to the container's RAM limit. No manual `-Xmx` tuning needed.

### Building the image locally

```powershell
cd quizadda_server
docker build -t quizadda-server .
docker run --rm -p 9797:9797 `
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://..." `
  -e SPRING_DATASOURCE_USERNAME="..." `
  -e SPRING_DATASOURCE_PASSWORD="..." `
  -e JWT_SECRET="$(-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_}))" `
  quizadda-server
```

## Conventions

- **DTOs**, not entities, cross controller boundaries. Entities are an implementation detail of the persistence layer.
- **Java records** for DTOs (immutable, generated boilerplate).
- **Constructor injection** via Lombok `@RequiredArgsConstructor`. Never field injection.
- **`@Transactional` on services**, not controllers. Read-only operations use `@Transactional(readOnly = true)`.
- **Bean Validation** (`@Valid` + JSR-380 annotations) on every write endpoint.
- **No business logic in controllers** — they handle HTTP concerns (status codes, location headers) and delegate.
- **Lombok**: `@Getter`/`@Setter` on entities, `@RequiredArgsConstructor` for DI, `@Slf4j` for logging. Avoid `@Data` on entities (it breaks `equals`/`hashCode` semantics for managed objects).
- **Logging** via SLF4J (`@Slf4j`). Never log tokens, passwords, or PII at info+ levels.
