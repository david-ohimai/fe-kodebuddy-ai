# KodeBuddy AI — Frontend

KodeBuddy AI is a learning platform for coding bootcamps with an AI teaching assistant built in. Learners ask **"Ask KodeBuddy"** about their course and get answers grounded in their own curriculum. When the AI isn't confident, the question is escalated to their trainer.

This repo is the **Next.js web app**. The FastAPI backend and AI agent are at **[david-ohimai/be-kodebuddy-ai](https://github.com/david-ohimai/be-kodebuddy-ai)**.

> Built as a team capstone project at KodeCamp. This is a portfolio copy of the original team repository, with full commit history kept.

---

## Features

**Four role-based workspaces, each with its own dashboard, navigation and route guards:**

| Role | What they can do |
|---|---|
| **Learner** | Browse courses, modules and lessons; track progress; complete and submit assignments; **chat with the KodeBuddy AI assistant**; escalate questions and follow trainer replies |
| **Trainer** | Manage course content, resources and FAQs; create and grade assignments; answer escalated questions; recommend resources; send check-ins and reminders to their cohort |
| **Mentor** | Follow assigned learners' progress, send check-ins, recommend resources |
| **Admin** | Manage users and roles, cohorts, courses and content; assign trainers and learners |

**Plus:**
- **AI chat panel** available on every learner screen, with stage indicators ("retrieving…", "answering…"), word-by-word answer rendering, linked course resources in answers, and one-click escalation to a trainer.
- **Assignment guidance:** the assistant gets the assignment brief as context, so its help is specific to the task.
- **Resource uploads with AI indexing status:** trainers upload files as multipart form data, and a badge shows when the AI has finished indexing them.
- **Auth flows:** sign-up with email verification (OTP), sign-in, forgot and reset password, onboarding, and JWT access/refresh token handling.
- **Notifications and recent-activity feeds** for every role.

## Tech stack

| Area | Tools |
|---|---|
| Framework | **Next.js 16** (App Router), **React 19**, TypeScript |
| UI | Material UI 9, Tailwind CSS 4, Lucide icons |
| Forms and validation | React Hook Form, Zod |
| Dates | Day.js, MUI X Date Pickers |
| Tooling | pnpm, ESLint, Prettier, GitHub Actions CI (lint + build) |

## My contributions (David Ohimai)

- **Built the KodeBuddy AI chat experience end to end:** the chat panel ([`KodeBuddyChatPanel.tsx`](src/components/chat/KodeBuddyChatPanel.tsx)), the typed chat API client ([`chat.api.ts`](src/lib/api/chat.api.ts)) with progressive answer rendering and an automatic retry for assignment-guidance requests, and the frontend–backend **chat API contract** ([`docs/chat-api-contract.md`](docs/chat-api-contract.md)).
- **Rebuilt the learner assignments screens and added the submission flow**, including a route-level error boundary and fixes for layout and scrolling bugs.
- **Implemented escalations and notifications** for learners and trainers: escalate from chat, follow the escalation thread, notification menu, and trainer responses.
- **Resource upload and extraction status:** switched uploads to multipart and added the AI-indexing badge.
- **Admin features:** adding learners to a course, and assigning a trainer when creating a course.
- **Shared API layer** ([`src/lib/api/`](src/lib/api/)): typed clients for assignments, submissions, cohorts, courses, resources, escalations and notifications.

## Running locally

**Prerequisites:** Node.js 20+ and [pnpm](https://pnpm.io/).

```bash
pnpm install
cp .env.example .env.local     # points at the hosted backend by default
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Purpose |
|---|---|
| `API_ORIGIN` | Server-side target of the `/api/backend` rewrite in `next.config.ts` |
| `NEXT_PUBLIC_API_URL` | Backend URL for server-side calls; fallback for `API_ORIGIN` |
| `NEXT_PUBLIC_USE_DIRECT_API` | Optional. Set to `true` to call the API directly from the browser instead of through the rewrite |

To run against a local backend, set both URLs to `http://localhost:8000`.

Other scripts: `pnpm build`, `pnpm lint`, `pnpm format`.

## Project structure

```
src/
├── app/
│   ├── (public)/         # landing page
│   ├── (auth)/           # sign-in, sign-up, password reset
│   ├── onboarding/
│   └── (protected)/      # role-gated areas
│       ├── (learner)/    #   dashboard, learn, assignments, progress, resources
│       ├── trainer/      #   my course, my cohort, escalations
│       ├── mentor/       #   my learners, notifications
│       └── admin/        #   users, cohorts, courses and contents
├── components/           # shared UI kit, chat panel, layout, notifications
├── lib/api/              # typed API clients
└── types/
docs/                     # API contracts
```

## Team

KodeBuddy AI was built by a cross-functional team on the KodeCamp capstone programme. See the [contributors graph](../../graphs/contributors) for everyone who worked on this repo.
