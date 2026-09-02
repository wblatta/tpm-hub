# TPM Hub

A mission control surface for Technical Program Managers.

This is a **presentation scaffold** — a portfolio demo of *Cerebro*, a local-first mission
control app I built and used daily as a TPM at Netflix. The UI here is real and fully
interactive. The data is mocked: there are no live integrations, no database, and no model
calls. Fetch, aggregation, and inference are deliberately out of scope.

## What it demonstrates

The workflow the real tool was built around:

**Sync → Generate insights → Inbox (human-in-the-loop gate) → Publish**

Nothing a model produces reaches another system without a person approving it. That gate is
the centerpiece of the demo, not a detail — approving an item from the Inbox moves it out of
the queue, decrements the sidebar badge, appends a run to the agent log with its own token
count and cost, and lands an entry on the program it belongs to.

Every generated artifact carries its **provenance** — the specific Slack threads, Jira issues,
Confluence pages, calendar events, and pull requests it was synthesized from. That's the
difference between a model writing a plausible paragraph and a model producing something
auditable.

## Routes

| Route | What's there |
|---|---|
| `/` | Morning Brief on a bento dashboard — spend, open risks, portfolio health, approval queue |
| `/inbox` | The approval queue. Expand an item to read the full draft, its sources, and its confidence, then approve, edit, or reject with a reason |
| `/programs` | Portfolio table — RAG status, open risks, progress, target dates |
| `/programs/[key]` | Program detail — generated status narrative with sources, risk register, action items, decisions, achievements, activity, stakeholders |
| `/agent-runs` | Every model call with skill, model tier, tokens, duration, and USD cost. Includes failures and low-confidence results |
| `/stakeholders` | Directory with the communication preferences that shape how updates get written |
| `/integrations` | Five sources with sync state, record counts, and scopes — one deliberately in an error state |

Press `⌘K` for the command palette. The topbar has a theme toggle (dark default, light fully
supported) and a reset control that restores the demo state so the approval flow can be
replayed.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Zustand · next-themes

Reads go through a repository layer in `lib/data/` whose functions are shaped like real
queries, backed by typed fixtures in `lib/fixtures/`. Mutable demo state lives in a Zustand
store. Dates are stored as offsets and resolved at mount, so the demo never reads as stale.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploying

The app builds to a static bundle — no Node runtime on the server:

```bash
npm run build        # emits ./out
```

Copy `out/` to any web server. Live at
**[wblatta-tpm-hub.dreamhosters.com](https://wblatta-tpm-hub.dreamhosters.com/)**.

### DreamHost — FTP

```bash
npm run build
```

`.htaccess` is injected automatically by the `postbuild` script. Note that `next build` wipes
`out/` each time, so never copy files in before building — anything added beforehand is
deleted.

Upload the **contents** of `out/` (not the folder itself) into the domain's web directory,
`~/wblatta-tpm-hub.dreamhosters.com/`. Roughly 97 files, 2.3 MB.

Three things to get right:

- **Enable "show hidden files"** in the FTP client before uploading, or `.htaccess` is
  silently skipped — it's the only dotfile in the bundle. It lives at `out/.htaccess`; the
  source is `deploy/htaccess` (no leading dot, so it stays visible in the repo).
- **Transfer in binary mode.** The bundle includes `.woff2` fonts and `.ico` files; ASCII mode
  corrupts them. Auto-detect handles this in most clients, but force binary if fonts render
  as fallbacks.
- **Delete the old `_next/` directory before re-uploading.** Asset filenames are
  content-hashed, so old builds accumulate rather than overwrite.

### DreamHost — rsync

If the domain has shell access, `scripts/deploy.sh` handles the above automatically:

```bash
DH_USER=your_shell_user ./scripts/deploy.sh          # dry run
DH_USER=your_shell_user ./scripts/deploy.sh --live   # upload
```

It builds (which injects `.htaccess`) and syncs with `--delete` so stale assets don't pile up.
Override `DH_HOST` or `DH_PATH` if the web directory differs.

### Why no rewrite rules are needed

`trailingSlash` is on, so every route is a real directory containing `index.html` — Apache
serves them natively. The `.htaccess` is an enhancement, not a requirement: it disables
MultiViews, points 404s at the styled `404.html`, and caches hashed assets for a year while
keeping HTML revalidating. Without it the site still works; you just get Apache's default 404
and weaker caching.

### Subdirectory hosting

```bash
BASE_PATH=/tpm-hub npm run build
```

Also deploys unchanged to Vercel, Netlify, or GitHub Pages.

## About the real tool

Cerebro was Next.js + React + TypeScript on SQLite (`better-sqlite3`), local-first by design —
no hosted backend, each user running their own copy with their own data. Roughly 24k lines,
45 sequential migrations, and ~130 PRs over about four and a half months, built solo using
Claude Code with me as architect, reviewer, and product owner. It carried around 120 test
files, including a snapshot test that locked AI-insight output so prompt changes had to be
deliberately re-approved rather than silently drifting.

This repo intentionally carries no test suite. It's a scaffold for showing an interface, not a
tool anyone will run in anger — the verification gate here is `tsc --noEmit` and `next build`.

Integrations are shown under real product names for legibility. The tool this models ran
against internal equivalents.
