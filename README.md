# Baldie.ai

A personal AI/ML learning project that turns link-sharing into a publishing pipeline. Drop a URL, get a structured blog post. Built in public as part of my journey into AI engineering.

---

## Why this exists

I'm actively learning AI/ML — reading papers, trying new tools, following the field as it moves fast. The problem is the gap between *finding* something interesting and *actually doing something useful with it*. Most of the time a link gets bookmarked and forgotten.

Baldie.ai is my attempt to close that gap. It forces me to synthesize what I'm learning by publishing it — and it lets anyone following along get a structured, opinionated take on what's worth paying attention to and why it matters for building a career in AI.

The blog isn't just a feed. Every post answers four questions:

- **TL;DR** — what is this, in plain English?
- **Career Impact** — how does this affect someone trying to build in AI right now?
- **Technical Breakdown** — what's actually happening under the hood?
- **Action Items** — what can you do with this today?

That structure comes from how I personally try to process new information. The AI generates a first draft; I review and publish. The result is a post that's faster to produce than writing from scratch and more useful than a raw link dump.

---

## What's in this repo

This is a monorepo with two services:

| Service | What it does |
|---|---|
| `apps/web` | Next.js 15 + Payload CMS 3 — the blog frontend and content management system |
| `apps/brain` | Node.js worker — scrapes URLs and synthesizes content using an AI model |

Supporting infrastructure (local dev):

| Tool | Role |
|---|---|
| PostgreSQL 16 | Content store (Payload CMS backend) |
| Redis 7 | Job queue (BullMQ) |
| Docker Compose | Runs Postgres and Redis locally with one command |

---

## How it works

```
You paste a URL
      ↓
Payload CMS creates an Article (status: pending)
      ↓
afterChange hook enqueues a BullMQ job in Redis
      ↓
Brain worker picks up the job
      ↓
Scrapes the URL (HTTP → Playwright fallback)
      ↓
AI synthesizes into a four-section post
      ↓
Article updated to draft in Payload
      ↓
You review and publish in one click
      ↓
Post goes live on the public blog
```

If scraping fails, the job retries automatically (3x, exponential backoff). If it fails all three times, it lands in a dead-letter queue for manual inspection — nothing is silently dropped.

---

## Current status — Phase 1 (Pipeline Skeleton)

Phase 1 wires the plumbing without AI. The full flow works end-to-end:

- Submit a URL in Payload admin
- Brain picks up the job, scrapes the page
- Article moves from `pending` → `processing` → `draft`

AI synthesis is stubbed out in this phase — the Brain marks articles as draft with the scraped page title. This lets the whole pipeline be verified before any AI API keys are needed.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- npm v10+

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/baldie.ai.git
cd baldie.ai
npm install
```

### 2. Set up environment variables

The repo ships with `.env.example` files. Copy them:

```bash
# Root (Docker credentials)
cp .env.example .env

# Web app (Payload + database)
cp apps/web/.env.example apps/web/.env

# Brain worker
cp apps/brain/.env.example apps/brain/.env
```

The defaults work out of the box for local development. No API keys are needed to run Phase 1.

### 3. Start the database and queue

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 4. Start the web app

```bash
cd apps/web
npm run dev
```

On first run, Payload automatically migrates the database schema. Visit `http://localhost:3000/admin` and create your admin account.

### 5. Start the Brain worker

Open a second terminal:

```bash
cd apps/brain
npm run dev
```

You should see:

```
[Brain] Starting article-processing worker...
[Brain] Worker listening on queue: article-processing
```

### 6. Submit your first link

1. Go to `http://localhost:3000/admin`
2. Open the **Articles** collection
3. Create a new article — paste any URL into the **Source URL** field
4. Save it

Watch the Brain terminal. Within a few seconds you'll see:

```
[Brain] Processing job 1 — article abc123 (https://...)
[Brain] Scraped https://... — 4821 chars
[Brain] Article abc123 → draft
```

The article status in Payload will update from `pending` → `draft`. That's the full Phase 1 pipeline working.

---

## Project structure

```
baldie.ai/
├── docker-compose.yml
├── .env.example                        ← Docker credentials template
├── apps/
│   ├── web/
│   │   ├── payload.config.ts           ← CMS config, collections, plugins
│   │   ├── next.config.ts
│   │   ├── .env.example
│   │   └── src/
│   │       ├── payload/
│   │       │   ├── collections/
│   │       │   │   ├── Articles.ts     ← Article schema + status machine
│   │       │   │   └── Users.ts
│   │       │   └── hooks/
│   │       │       └── enqueueArticle.ts  ← Fires on save → Redis queue
│   │       └── app/
│   │           ├── (payload)/          ← Admin panel + REST API routes
│   │           └── (frontend)/         ← Public blog (Phase 3)
│   └── brain/
│       ├── .env.example
│       └── src/
│           ├── index.ts                ← Entry point + graceful shutdown
│           ├── worker.ts               ← BullMQ job processor
│           ├── scraper.ts              ← HTTP scrape + Playwright fallback
│           ├── synthesize.ts           ← AI abstraction (Claude / OpenAI)
│           ├── payload-client.ts       ← PATCH articles back to Payload
│           └── config.ts               ← Env var config
```

---

## Roadmap

- **Phase 1 — Pipeline Skeleton** ✅ ← you are here
- **Phase 2 — The Brain** — wire in the AI model, implement the four-section prompt, full scrape → synthesize → draft flow
- **Phase 3 — Frontend & Review Dashboard** — public blog, `/review` route for one-click publishing
- **Phase 4 — Production Deploy** — Railway deployment, environment config, health checks
- **Phase 5 — Mobile** — React Native share extension for iOS/Android

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + CMS | Next.js 15 + Payload CMS 3 | Co-located so the blog and admin share one deploy |
| Database | PostgreSQL | Payload's recommended adapter; reliable, easy to host |
| Queue | Redis + BullMQ | Persistent jobs, automatic retries, dead-letter queue |
| Worker | Node.js / TypeScript | Same language as the web app, strong ecosystem for scraping |
| AI | Model-agnostic (Claude / GPT-4o) | Abstracted behind a `synthesize()` interface — provider can be swapped |
| Hosting | Railway (Phase 4) | Simple deploys, good support for persistent workers |

---

## Contributing

This is a personal learning project built in public. If you're on a similar journey and want to follow along, the best place is the live blog (coming in Phase 3). Issues and PRs are welcome but keep in mind the project prioritises learning over production polish.

---

## License

MIT
