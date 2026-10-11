# Task Manager Web

A small React client for the [Task Manager API](https://github.com/r3vi28/task-manager-api), a REST API with JWT authentication, projects, tasks and role-based access control.

The backend is the main piece of this project. This frontend exists to show the API working end to end, so it is intentionally small: no state library, no UI kit, just React, TypeScript and a thin `fetch` wrapper.

- **API:** https://task-manager-api-vk0z.onrender.com
- **API docs (Swagger):** https://task-manager-api-vk0z.onrender.com/api/docs
- **Backend repository:** https://github.com/r3vi28/task-manager-api

> The API runs on a free plan and sleeps when idle. The first request can take up to a minute; the app shows a "waking up the server" notice while it boots.

## Demo account

Click **Use demo account** on the login screen, or sign in with:

| Email | Password | Role |
| --- | --- | --- |
| `member@demo.com` | `Demo1234!` | MEMBER |

Deleting tasks is restricted to the `ADMIN` role, so the delete button is hidden for this account.

## Features

- Login with JWT; the session persists across reloads until the token expires
- List and create projects, with per-project progress (`3 of 5 tasks done`)
- Create, edit and complete tasks with status, priority and due date
- Filter tasks by status; the filter is stored in the URL (`?status=DONE`)
- Delete tasks (admins only)
- Field-level validation errors coming from the API

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · pnpm

## Getting started

Requires Node.js 22+ and pnpm.

```bash
pnpm install
cp .env.example .env   # then set VITE_API_URL
pnpm dev
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, without a trailing slash. Use `https://task-manager-api-vk0z.onrender.com` to run against production. |

Other scripts: `pnpm build`, `pnpm preview`, `pnpm lint`.

## Project structure

```
src/
  api/          fetch wrapper (client.ts) and one module per resource
  auth/         token storage and client-side JWT decoding
  components/   forms, task card, layout and small UI pieces
  hooks/        useIsSlow (delayed "waking up the server" notice)
  pages/        Login, Projects, Project detail
  dates.ts      due date conversion (see below)
  labels.ts     display labels for statuses and priorities
  types.ts      API response types
```

## Design decisions

**One `fetch` wrapper for every request** (`src/api/client.ts`). It adds the `Authorization` header and turns every failure into an `ApiError` with a `status`, a readable `message` and optional `fieldErrors`. The API returns `{ message }` where `message` is either a string or an object of per-field errors, and some errors come back as an HTML page; all three cases are handled in one place. There is no request timeout on purpose, because of the cold start.

**Sessions without a `/me` endpoint.** The JWT payload (`{ id, role, iat, exp }`) is decoded in the browser to read the role and the expiry. The signature is not verified on the client (only the server can do that), and the role is only used to show or hide UI; the API enforces permissions. Any `401` clears the token and redirects to the login page, except on the login request itself, where it means wrong credentials.

**Handling API quirks in the client:**

- `PUT /api/tasks/:id` resets `status` and `priority` to their defaults when they are omitted. The `TaskUpdate` type makes both fields required, so the compiler rejects an update that forgets them.
- `dueDate` must be a UTC ISO string. A due date is a calendar day, so it is sent at `12:00 UTC` and always displayed in UTC, which keeps the selected day from shifting in any timezone.

**Local updates instead of refetching.** After creating, editing or deleting, the page applies the API response to its local state. Task filtering also happens on the client, because the project response already includes every task; this avoids extra round trips to a server that may be asleep.

**Explicit loading states.** Pages keep a single state value (`loading | error | ready`) instead of separate flags, so impossible combinations can't happen.

## Deployment

Deployed on Vercel as a static site. `vercel.json` rewrites every path to `index.html` so client-side routes like `/projects/3` work on reload. Set `VITE_API_URL` in the Vercel project settings; Vite reads it at build time.

## Out of scope

Registration, user management, deleting projects, task assignment and refresh tokens.
