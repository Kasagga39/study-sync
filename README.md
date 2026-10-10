# StudySync — Collaborative Study Planner

StudySync is a collaborative study-planning platform for university students who struggle to juggle
study groups, exam prep, assignments, and everything else. Instead of scattering work across group
chats, calendars, and file folders, StudySync gives students **one organized workspace** to manage
courses, study tasks, resources, and academic progress.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Team Members](#team-members)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Models](#data-models)
- [API Routes](#api-routes)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Product Demo Summary](#product-demo-summary)
- [Known Issues & Opportunities](#known-issues--opportunities)

## Features

- **Public landing page** explaining StudySync, its value, and how to get started.
- **Authentication** — sign up, log in, log out, protected routes, and per-user data access.
- **Course management** — full create, read, update, and delete of courses.
- **Task management** — tasks tied to a course with `Not Started`, `In Progress`, and `Completed`
  statuses, due dates, and full CRUD.
- **Resource management** — save links and metadata (title, description, URL) to a course.
- **File uploads & rich previews** — attach files (up to 8 MB) that are stored in MongoDB and served
  through a dedicated endpoint; resources show image thumbnails, file-type badges with sizes, and
  favicon previews for plain links.
- **Study-group sharing & real-time collaboration** — add study partners from a searchable list of
  existing accounts, collaborate on shared courses, and watch tasks, resources, and members update
  live via Server-Sent Events.
- **Home button** — every page links back to the public landing page.
- **Dashboard** — counts of courses/active/completed tasks, overall completion percentage, and an
  upcoming-tasks stream.
- **Course workspace** — a dedicated page per course with its tasks, resources, members, and progress.
- **Design system** — consistent Tailwind CSS palette, typography, spacing, and reusable components,
  responsive on desktop and mobile, with light/dark support.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **MongoDB** with **Mongoose**
- **JWT** auth (httpOnly cookie) with `jsonwebtoken`/`jose` and `bcryptjs`
- **Git & GitHub**
- **Vercel** (recommended deployment)

The app demonstrates a full **client → API route handler → MongoDB** flow: client components call
route handlers, which run Mongoose queries against the database.

## Team Members

- Kasagga39 (GitHub) — _add remaining team members here_

## Getting Started

### Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Install & run locally

```bash
# 1. Clone
git clone https://github.com/Kasagga39/study-sync.git
cd study-sync

# 2. Install dependencies
npm install

# 3. Configure environment variables (see below) in .env
# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If port 3000 is busy, Next.js automatically picks the next free port — check the terminal output.

### Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the development server          |
| `npm run build`        | Create a production build             |
| `npm run start`        | Run the production build              |
| `npm run lint`         | Run ESLint                            |
| `npm run typecheck`    | Run the TypeScript compiler (no emit) |
| `npm run format`       | Format the codebase with Prettier     |
| `npm run format:check` | Verify formatting without writing     |

## Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
AUTH_SECRET="a-long-random-string-used-to-sign-jwt-cookies"
```

> `.env` is gitignored. Never commit secrets.

## Data Models

| Model      | Fields                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`     | `name`, `email` (unique), `password` (hashed), `createdAt`                                                                                   |
| `Course`   | `name`, `description`, `ownerId → User`, `members [→ User]`, `createdAt`                                                                     |
| `Task`     | `title`, `description`, `courseId → Course`, `userId → User`, `dueDate`, `status`, `createdAt`                                               |
| `Resource` | `title`, `description`, `url`, `fileName`, `contentType`, `fileSize`, `fileData` (binary), `courseId → Course`, `userId → User`, `createdAt` |

## API Routes

All application routes require authentication (httpOnly `token` cookie). Unauthorized requests
receive `401`. Responses follow `{ success: boolean, data?, error? }`.

### Auth

| Method | Route              | Description                                  |
| ------ | ------------------ | -------------------------------------------- |
| `POST` | `/api/auth/signup` | Create an account and set the session cookie |
| `POST` | `/api/auth/login`  | Log in and set the session cookie            |
| `POST` | `/api/auth/logout` | Clear the session cookie                     |
| `GET`  | `/api/auth/me`     | Return the current authenticated user        |

### Courses

Courses are visible to their **owner and all members** (`members` array). Only the owner can update,
delete, or share a course.

| Method   | Route               | Description                                     |
| -------- | ------------------- | ----------------------------------------------- |
| `GET`    | `/api/courses`      | List courses the user owns or is a member of    |
| `POST`   | `/api/courses`      | Create a course (current user becomes owner)    |
| `GET`    | `/api/courses/{id}` | Get one course (owner or member)                |
| `PATCH`  | `/api/courses/{id}` | Update a course's name/description (owner only) |
| `DELETE` | `/api/courses/{id}` | Delete a course (owner only)                    |

### Members & Sharing

| Method   | Route                       | Description                                                  |
| -------- | --------------------------- | ------------------------------------------------------------ |
| `GET`    | `/api/courses/{id}/members` | List the owner and members (participants only)               |
| `POST`   | `/api/courses/{id}/members` | Add a member by `email` or `userId` (owner only, idempotent) |
| `DELETE` | `/api/courses/{id}/members` | Remove a member by `userId` (owner only)                     |

### Users

| Method | Route                         | Description                                                                |
| ------ | ----------------------------- | -------------------------------------------------------------------------- |
| `GET`  | `/api/users?query=&courseId=` | Search existing accounts to add; excludes self and existing course members |

### Tasks

Tasks may be created and viewed by any participant of the course; updates/deletes are allowed for the
task creator or the course owner.

| Method   | Route             | Description                                                         |
| -------- | ----------------- | ------------------------------------------------------------------- |
| `GET`    | `/api/tasks`      | List tasks across the user's courses (optional `?courseId=` filter) |
| `POST`   | `/api/tasks`      | Create a task (must be a course participant)                        |
| `GET`    | `/api/tasks/{id}` | Get one task (participant)                                          |
| `PATCH`  | `/api/tasks/{id}` | Update title/description/status/due date                            |
| `DELETE` | `/api/tasks/{id}` | Delete a task                                                       |

### Resources

`POST /api/resources` accepts **either** `application/json` (`title`, `description`, `url`,
`courseId`) **or** `multipart/form-data` (same fields plus an optional `file`, max 8 MB → `413`).
A resource must include a URL or an uploaded file. Uploaded files are stored in MongoDB and returned
without their binary payload in JSON responses.

| Method   | Route                      | Description                                   |
| -------- | -------------------------- | --------------------------------------------- |
| `GET`    | `/api/resources`           | List resources (optional `?courseId=` filter) |
| `POST`   | `/api/resources`           | Create a resource (JSON **or** multipart)     |
| `GET`    | `/api/resources/{id}`      | Get one resource                              |
| `PATCH`  | `/api/resources/{id}`      | Update a resource                             |
| `DELETE` | `/api/resources/{id}`      | Delete a resource                             |
| `GET`    | `/api/resources/{id}/file` | Stream an uploaded file's bytes               |

### Real-time (Server-Sent Events)

| Method | Route                      | Description                                                               |
| ------ | -------------------------- | ------------------------------------------------------------------------- |
| `GET`  | `/api/courses/{id}/events` | SSE stream of course changes (tasks/resources/members), participants only |

## Project Structure

```
app/
  api/            # Route handlers (auth, courses, tasks, resources)
  courses/        # Course list + [id] workspace pages
  dashboard/      # Authenticated dashboard
  login, signup/  # Auth pages
  page.tsx        # Public landing page
  layout.tsx      # Root layout
components/       # Reusable UI components
lib/              # auth, mongodb, serialize, access (participants), events (SSE pub/sub)
models/           # Mongoose models
types/            # Shared TypeScript types
proxy.ts          # Route protection (Next.js 16 "proxy" = middleware)
```

## Deployment

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. In **Project Settings → Environment Variables**, add `MONGODB_URI` and `AUTH_SECRET`.
   In MongoDB Atlas, whitelist `0.0.0.0/0` (or Vercel's IPs) so the serverless functions can connect.
4. Deploy. Vercel runs `next build` automatically.

## Product Demo Summary

See [PRODUCT_DEMO.md](./PRODUCT_DEMO.md) for the written product demo summary.

## Known Issues & Opportunities

**Known limitations**

- Deleting a course does not cascade-delete its tasks/resources (they become orphaned).
- Real-time updates use an in-memory pub/sub hub, so live collaboration works on a single server
  instance (fine for `next dev` and a single Vercel instance) but is not shared across instances.
- Files are stored as binary documents in MongoDB and capped at 8 MB; there is no external blob
  storage or thumbnail generation yet.
- No email verification, password reset, OAuth, or 2FA yet.

**Future opportunities**

- Google / GitHub OAuth and password reset.
- Durable real-time via WebSockets or a hosted pub/sub (e.g. Pusher, Ably, Redis).
- Object storage (S3/Vercel Blob) for large files and image thumbnailing.
- Reminders/notifications for upcoming due dates.
- Per-course analytics and calendar integration.
