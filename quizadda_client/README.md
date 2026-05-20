# QuizAdda — Frontend (Angular)

Single-page application for the QuizAdda quiz portal. Calls a Spring Boot REST API and authenticates via JWT bearer tokens.

> **Looking for the project overview?** See the [root README](../README.md).
> **Looking for the backend?** See [`quizadda_server/`](../quizadda_server/README.md).

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment configuration](#environment-configuration)
- [Local development](#local-development)
- [Build](#build)
- [Deploying to Vercel](#deploying-to-vercel)
- [Authentication flow on the client](#authentication-flow-on-the-client)
- [Services overview](#services-overview)
- [Routes & guards](#routes--guards)

---

## Tech stack

| Concern | Library |
|---|---|
| Framework | Angular 16 |
| UI | Angular Material, Bootstrap Grid only (CSS) |
| Auth | JWT bearer (stored in `localStorage`) |
| HTTP | `HttpClient` + custom interceptor that stamps every request with `Authorization: Bearer <token>` |
| UX dialogs | SweetAlert2 |
| Forms | Template-driven (`ngModel`) |

## Project structure

```
src/
├── app/
│   ├── components/         Shared shell components (navbar, footer)
│   ├── pages/              Route-level components
│   │   ├── admin/          Admin dashboard + CRUD pages
│   │   └── user/           User dashboard, instructions, start-page, etc.
│   ├── services/           HTTP services + auth helpers + route guards
│   │   ├── helper.ts       Reads `environment.apiUrl` (the single base URL)
│   │   ├── login.service.ts
│   │   ├── auth.interceptor.ts
│   │   ├── *.guard.ts
│   │   └── category|quiz|question|user.service.ts
│   ├── models/             TypeScript interfaces
│   ├── app-routing.module.ts
│   └── app.module.ts
├── environments/
│   ├── environment.ts          dev: points at http://localhost:9797
│   └── environment.prod.ts     prod: points at the deployed Render URL
└── styles.css
```

## Environment configuration

The base URL of the backend lives in two files and is swapped automatically by Angular based on the build configuration:

**`src/environments/environment.ts`** — used by `ng serve` (dev):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:9797'
};
```

**`src/environments/environment.prod.ts`** — used by `ng build` / production builds (incl. Vercel):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-server.onrender.com'
};
```

The substitution is wired through `fileReplacements` in [`angular.json`](angular.json):
```json
"production": {
  "fileReplacements": [
    { "replace": "src/environments/environment.ts",
      "with":    "src/environments/environment.prod.ts" }
  ]
}
```

All HTTP services import their base URL from [`services/helper.ts`](src/app/services/helper.ts), which simply re-exports `environment.apiUrl`. **Change the URL in one place** (the env file) and every service follows.

## Local development

**Prerequisites:** Node.js 18+, npm 9+, Angular CLI (`npm i -g @angular/cli`).

```powershell
npm install
npm start              # http://localhost:4200, hot-reload
```

By default `npm start` runs `ng serve`, which uses the **dev** environment and expects the backend at `http://localhost:9797`.

If your backend is on a different port or host, override the dev URL in `environment.ts`.

## Build

```powershell
npm run build          # Production build into dist/
```

This produces hash-bundled JS/CSS in `dist/quizadda_client/`. Serve any static-file host (Vercel, Netlify, S3+CloudFront) at that directory.

## Deploying to Vercel

1. Connect your GitHub repo to Vercel.
2. Set the **Root Directory** to `quizadda_client`.
3. Build & Output settings (Vercel auto-detects most of these):
   - Build command: `npm run build`
   - Output directory: `dist/quizadda_client`
4. After the backend is deployed to Render, update [`environment.prod.ts`](src/environments/environment.prod.ts) with the live API URL, push, and Vercel rebuilds automatically.

### Heads-up: Render cold starts

The first request after a long idle period waits ~30–60 s for the backend dyno to wake. Users will see a longer-than-usual spinner; consider a "Warming up server..." hint on the login page during initial load.

## Authentication flow on the client

```
[ login.component ]
   |  POST /api/v1/auth/login  { username, password }
   v
[ login.service.generateToken ]  ----------->  Backend
                                                  |
   <--------- 200 OK { token, user } -------------+
   |
   |  localStorage.setItem('token', token)
   |  GET /api/v1/auth/me   (Authorization: Bearer <token> added by interceptor)
   v
[ login.service.getCurrentUser ] ----------->  Backend
   |
   <--------- 200 OK { id, username, authorities, ... } ----+
   |
   |  localStorage.setItem('user', JSON.stringify(user))
   v
[ AdminGuard / UserGuard / loginStatusSubject ] ----- route to /admin or /user-dashboard
```

The **`AppInterceptor`** (`src/app/services/auth.interceptor.ts`) is registered on every outbound request and adds the bearer header automatically — no service has to think about it.

The **`LoginService.getUserRole()`** helper reads `user.authorities[0]` (the backend serializes `Set<String>` as a JSON array — e.g. `["USER"]` or `["ADMIN"]`).

## Services overview

All services live in `src/app/services/`. Every one of them imports `baseUrl` from `helper.ts` and targets `${baseUrl}/api/v1/...`.

| Service | What it does | Backend resource |
|---|---|---|
| `LoginService` | Issue + store JWTs, expose `isLoggedIn`, `logout`, `getUserRole` | `/api/v1/auth/**` |
| `UserService` | User registration | `/api/v1/users` |
| `CategoryService` | List, create, delete categories | `/api/v1/categories` |
| `QuizService` | CRUD quizzes, filter by category, list active, **evaluate** | `/api/v1/quizzes` |
| `QuestionsService` | Manage questions, fetch user-facing random subset (no answers) | `/api/v1/questions` |

`QuizService.evaluateQuiz(quizId, questions)` reshapes the in-memory questions array into the request the backend expects:
```typescript
{
  answers: [
    { quesId: 1, chosenAnswer: 'A' },
    { quesId: 2, chosenAnswer: '' },
    ...
  ]
}
```
The backend ignores client-sent correct answers and scores against its own answer key.

## Routes & guards

- **`AdminGuard`** — gates `/admin/**` routes; requires `getUserRole() === "ADMIN"`.
- **`UserGuard`** — gates `/user-dashboard/**` and quiz-taking routes; requires `getUserRole() === "USER"`.
- Both guards redirect unauthenticated visitors to `/login`.

Route definitions live in [`app-routing.module.ts`](src/app/app-routing.module.ts).
