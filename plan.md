# Project: baldie.ai — AI Learning & News Board

## 1. Purpose

A personal content pipeline that captures AI news/tool links, synthesizes them into structured blog posts using an AI agent, and publishes them to a public-facing blog. A small team can also submit links. Posts are lightly reviewed before publishing via a custom dashboard.

---

## 2. Resolved Architecture

| Service | Role | Tech |
|---|---|---|
| **The Interface** | Blog frontend + review dashboard | Next.js (App Router), co-located with Payload |
| **The Vault** | Headless CMS + content store | Payload CMS + PostgreSQL |
| **The Queue** | Job buffer between Vault and Brain | Redis + BullMQ |
| **The Brain** | Scrapes links, calls AI, generates posts | Node.js / TypeScript |

**Deployment:** Railway (all services)
**AI Model:** Model-agnostic — abstracted so the provider can be swapped (Claude, GPT-4o, etc.)
**Mobile:** React Native share extension — important but built after the web pipeline is working.

---

## 3. Service Communication Flow

1. **Ingestion:** A team member submits a URL via the web interface or (later) the React Native share extension. The app POSTs to Payload CMS, creating an `Article` record with `status: "pending"`.
2. **Enqueue:** A Payload `afterChange` hook publishes a BullMQ job to Redis containing the article ID and URL.
3. **Processing (The Brain):** A BullMQ worker picks up the job and:
   - Attempts HTTP scrape (fast path).
   - Falls back to Playwright headless browser if the page is JS-rendered or blocks bots.
   - Calls the AI model to synthesize the content into a structured post.
   - PATCHes the Payload article to `status: "draft"` with the generated content.
4. **Review:** A team member receives a notification and reviews the draft in the custom dashboard (a protected Next.js route). One-click publishes it.
5. **Publication:** Post goes live on the public blog, served by Next.js from Payload's local API.

---

## 4. Generated Post Structure

Every post follows this four-section format:

1. **TL;DR** — 2–3 sentence overview.
2. **Career Impact** — How this affects someone building an AI career.
3. **Technical Breakdown** — What the tool/news actually does under the hood.
4. **Action Items** — Concrete next steps for the reader.

Output is Markdown, stored in Payload, rendered by Next.js.

---

## 5. Access & Auth

- Payload admin panel is the primary interface for team members.
- Ingestion endpoint protected by API key (small team, no public submissions).
- Review dashboard is a protected route inside the Next.js app (Payload session auth).

---

## 6. Implementation Order

Build strictly in this sequence to avoid complexity creep:

### Phase 1 — Pipeline Skeleton ✅
- [x] Set up Payload CMS + PostgreSQL locally (Docker Compose).
- [x] Define the `Article` collection in Payload (`url`, `status`, `content`, `publishedAt`).
- [x] Stand up Redis locally.
- [x] Scaffold the Brain service (TypeScript, BullMQ worker, no AI yet).
- [x] Wire the Payload `afterChange` hook → BullMQ → Brain worker logs the job.
- [ ] Verify end-to-end: submit URL in Payload admin → job appears in Brain logs. *(requires Docker Desktop running)*

### Phase 2 — The Brain (Scrape + Synthesize)
- [x] Implement HTTP scraper in Brain (axios + cheerio).
- [x] Add Playwright fallback for JS-rendered pages.
- [x] Integrate AI model (abstracted behind a `synthesize(content)` interface).
- [x] Implement the four-section post prompt.
- [ ] Brain PATCHes the Payload article with generated Markdown on completion. *(wire `synthesize()` call in worker — stub currently in place)*

### Phase 2.5 — Discovery ("Hot in AI" Dashboard)
- [ ] Create `apps/web/src/lib/discovery/keywords.ts` — AI/ML keyword filter list.
- [ ] Create `apps/web/src/lib/discovery/hackernews.ts` — fetch top stories via HN Algolia API, filter to external URLs only.
- [ ] Create `apps/web/src/lib/discovery/reddit.ts` — fetch top posts from r/MachineLearning, r/LocalLLaMA, r/artificial via Reddit JSON API (no key required).
- [ ] Create `apps/web/src/lib/discovery/index.ts` — combine sources in parallel, deduplicate by URL, keyword-filter, sort by score, return top 40.
- [ ] Create `apps/web/src/app/(frontend)/discover/page.tsx` — protected Server Component; renders ranked list with score, source tag, and `[+ Add]` button per story.
- [ ] Create `apps/web/src/app/(frontend)/discover/actions.ts` — Server Action that creates an Article (`status: pending`) via Payload local API; existing `enqueueArticle` hook fires automatically.
- [ ] Add minimal nav to `apps/web/src/app/(frontend)/layout.tsx` linking Blog + Discover.
- [ ] Verify end-to-end: visit `/discover` → ranked AI stories appear → click Add → Article created in Payload → Brain picks up job.

### Phase 3 — Frontend & Review Dashboard
- [ ] Bootstrap Next.js App Router project, co-located with Payload (using `@payloadcms/next`).
- [ ] Build the public blog: article list page + article detail page.
- [ ] Build the protected `/review` route: draft list, post preview, publish button.
- [ ] Wire publish button → Payload PATCH `status: "published"`.

### Phase 4 — Production Deploy
- [ ] Deploy Postgres, Redis, Payload+Next.js, and Brain to Railway.
- [ ] Set up environment variables and internal service networking on Railway.
- [ ] Configure a Railway cron or health check to monitor the Brain worker.

### Phase 5 — Mobile (Post-Launch)
- [ ] React Native app with iOS/Android share extension.
- [ ] Share extension POSTs to the ingestion endpoint (same API key auth).

---

## 7. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Complexity creep** | Strict phase order — nothing in Phase 2 starts until Phase 1 is end-to-end working. |
| **Scraping failures** | HTTP-first with Playwright fallback. Brain marks job `failed` with error details if both fail — no silent drops. |
| **AI output quality** | Four-section prompt is structured and consistent. Light human review before publish acts as the quality gate. |
| **Queue job loss** | BullMQ persists jobs in Redis. Failed jobs go to a dead-letter queue for manual retry. |
| **Railway cold starts** | Brain worker runs as a persistent process (not serverless), so no cold start on job arrival. |
