# TPM Hub — Design Spec

**Date:** 2026-09-02
**Status:** Approved for planning
**Repo:** https://github.com/wblatta/tpm-hub

## Purpose

A portfolio demo of **Cerebro**, a local-first "mission control" web app for Technical
Program Managers built and used at Netflix. The demo is a presentation scaffold: the
UI is real, the data is mocked. Fetch, aggregation, and inference are not implemented.

The demo must simultaneously establish three things about its author:

1. **They build real infrastructure** — visible agent runs, token and USD cost,
   human-in-the-loop approval gates, source provenance on every generated artifact.
2. **They think like a senior TPM** — risk registers, decisions, program health,
   stakeholder context, status that writes itself.
3. **They have product taste** — a dashboard that reads as a funded product.

Explicitly **not** a goal: framing the demo around Netflix branding, or building
anything that will later become a usable tool. This scaffold is terminal.

## Source material

- `tpm_cerebro_context.md` — the author's portfolio write-up of the real Cerebro.
- https://genaisecretsauce.com/genai-secret-sauce-for-your-personal-agent-mission-control/
  — the "personal agent mission control" pattern the real tool was based on.

Facts from the write-up that the demo should stay consistent with: Next.js App Router
+ React + TypeScript, SQLite via `better-sqlite3` as the only datastore, ~24k LOC,
~120 test files, 45 sequential migrations, ~130 PRs over ~4.5 months, built solo with
Claude Code with the author as architect/reviewer.

Core flow of the real tool, preserved here: **Sync → Generate insights → Inbox
(human-in-the-loop gate) → Publish.**

## Non-goals

- No real integrations, network calls, API keys, or scheduled jobs.
- No database. No server runtime.
- No authentication.
- No test suite (see Verification).
- No conversion path to a working tool.

## Visual direction

Decided by side-by-side mockup review during brainstorming.

**Shell — "Refined Dark"** (Linear/Vercel register): 196px sidebar with grouped nav
and count badges, 42px topbar with breadcrumb, sync pill, and ⌘K affordance. Muted
neutrals, hairline borders, tight radii, restrained indigo accent.

**Dashboard — "Louder Bento"**: an asymmetric 6-column grid with varied spans
(`4×2 / 2 / 2 / 4 / 2 / 6`). Carries the violet AI accent that appears nowhere else
in the app, so violet reads as "this is model output" rather than decoration.

- Morning Brief — 4 cols × 2 rows, two-point mesh gradient, glowing sparkle mark,
  source-count chips, generation footer (`09:02 · 12.4k tok · $0.06`), and the
  Approve / Edit / Regenerate row.
- Agent spend — 2 cols, **fully filled violet gradient tile**, white on violet,
  40px numeral, budget rail. This tile is what makes the grid read as bento.
- Open risks — 2 cols, 40px amber numeral, 7-day sparkline.
- Programs — 4 cols, RAG dot, risk count, progress bar.
- Portfolio health — 2 cols, one segment per program.
- Inbox — full-bleed 6 cols, three cards with inline Approve/Edit. The HITL gate is
  deliberately the widest element on the page.

**Theming**: dark default, light fully supported. One CSS-variable token set swapped
via a `data-theme` attribute (`next-themes`). Light is a genuine remap, not an
inversion — violet deepens to `#7C3AED` and amber to `#B45309` to hold contrast on
white.

## Architecture

### Delivery

Static export (`output: 'export'`). `next build` produces an `out/` directory of
plain HTML/CSS/JS that drops onto nginx/Apache/Caddy with no Node runtime, and also
deploys unchanged to Vercel. `basePath` is env-configurable so the app can be served
from a subdirectory (e.g. `/tpm-hub`).

Consequences accepted: no route handlers, no middleware, no server actions, no
runtime image optimization (`images.unoptimized: true`). None are needed — all data
is build-time fixtures plus client state.

### Data layer

Two layers, deliberately seamed:

- `lib/data/` — a repository module per entity exposing query-shaped functions
  (`getPrograms()`, `getProgram(key)`, `getInboxItems()`, `getAgentRuns()`,
  `getStakeholders()`, `getIntegrations()`). Server components call these directly.
  Signatures are shaped like real queries so the seam to `better-sqlite3` is a
  one-directory change and can be described honestly in an interview.
- `lib/fixtures/` — deterministic seeded data. No `Math.random()` at render.

**Dates are stored as offsets, not absolutes**, and resolved against `Date.now()` at
mount. A demo with absolute timestamps says "synced 2m ago" in September and "synced
4 months ago" in January.

### State

Zustand store owns everything mutable — Inbox item status, derived badge counts,
appended agent runs, published-activity entries. Hydrated once from fixtures.
A `resetDemo()` action is wired to a control in the topbar so the approval moment can
be re-run during a live interview. A page refresh also restores clean state.

Server components render static reads; client islands wrap only mutable surfaces
(Inbox cards, theme toggle, ⌘K palette, reset control).

### Entities

`SourceRef` is the primitive that carries the demo's credibility:

```ts
type SourceRef = {
  provider: 'slack' | 'jira' | 'gcal' | 'confluence' | 'github'
  type: string          // 'thread' | 'issue' | 'event' | 'page' | 'pr'
  externalId: string    // '#playback-eng/p1725...' | 'PBT-1428' | '#4471'
  label: string
  url: string
  timestamp: number
}
```

Every generated artifact holds `SourceRef[]`. This powers the `⬡ 4 sources` chips and
is the difference between "AI wrote a paragraph" and "AI synthesized from these
specific records."

Remaining entities:

| Entity | Key fields |
|---|---|
| `Program` | `id`, `key` (e.g. `PBT`), `name`, `status` (green/amber/red), `progress`, `owner`, `startDate`, `targetDate`, `description` |
| `Risk` | `id`, `programId`, `severity` (high/med/low), `title`, `description`, `owner`, `status` (open/mitigating/closed), `openedAt`, `sources` |
| `Decision` | `id`, `programId`, `title`, `rationale`, `decidedAt`, `decidedBy`, `sources` |
| `Achievement` | `id`, `programId`, `title`, `date`, `sources` |
| `ActionItem` | `id`, `programId`, `title`, `owner`, `dueDate`, `status`, `confidence`, `sources` |
| `InboxItem` | `id`, `kind` (report/risk/extract/reply/agenda), `title`, `summary`, `payload`, `programId`, `createdAt`, `status` (pending/approved/rejected), `agentRunId`, `confidence`, `sources` |
| `AgentRun` | `id`, `skill`, `model`, `status` (ok/warn/error), `tokensIn`, `tokensOut`, `costUsd`, `startedAt`, `durationMs`, `note` |
| `Stakeholder` | `id`, `name`, `role`, `org`, `programIds`, `commsPrefs`, `lastInteraction` |
| `Integration` | `id`, `provider`, `status`, `lastSyncAt`, `recordCount`, `scopes`, `error` |

### Integrations presentation

Real brand names — **Slack, Jira, Google Calendar, Confluence, GitHub** — chosen for
instant legibility. Mock data uses matching identifiers: `#playback-eng`, `PBT-1428`,
PR `#4471`. The Integrations route shows per-source cards with last-sync time, record
counts, scopes, and one source in a recoverable error state.

Program content is plausible streaming-infrastructure work (Playback Telemetry v3,
Encoding Pipeline Migration, Partner SDK 4.0, Studio Asset Sync) without Netflix
branding or real internal system names.

## Routes

| Route | Contents |
|---|---|
| `/` | Morning Brief bento dashboard (above) |
| `/inbox` | Approval queue. Filter by kind/status. Each item expands to full payload with source list, confidence, and originating agent run. Approve / Edit / Reject. |
| `/programs` | Portfolio table — RAG status, progress, open risks, owner, target date |
| `/programs/[key]` | Program detail — status narrative, risk register, decisions, achievements, action items, activity feed, linked stakeholders. Every generated section shows its sources. |
| `/agent-runs` | Monospace run log — skill, model, status, tokens, cost, duration. Cost rollup and per-model breakdown. Includes failure and low-confidence rows. |
| `/stakeholders` | Directory — role, org, program membership, comms preferences, last interaction |
| `/integrations` | Five source cards — provider, status, last sync, record count, scopes; incremental-adoption framing ("useful with zero integrations configured") |

Cut during scoping, with reasons: an About/architecture route (the author narrates
this live) and an AI Skills / prompt library route (low value in the real tool
outside of authored automations).

## The approve flow

The single interaction that must feel real. Approving a `report` item:

1. Item leaves the Inbox queue and moves to `approved`.
2. Sidebar Inbox badge decrements (3 → 2).
3. A new `AgentRun` row is appended with plausible tokens and cost.
4. The target program's activity feed gains a "status published" entry.
5. The Dashboard brief and counts reflect the change.

Rejecting prompts for a reason and records it on the item and the run log. Editing
opens the payload in an editable surface before approving.

## Stack

- Next.js (App Router) + React + TypeScript, strict mode
- Tailwind CSS
- shadcn/ui (Radix primitives) — Dialog, DropdownMenu, Badge, Table, Tooltip, Command
- Zustand for demo state
- next-themes for the dark/light token swap
- Recharts only if a chart earns its place; sparklines and meters are CSS

Naming: the app is **TPM Hub**, matching the repo. The README identifies Cerebro as
the internal predecessor it models.

## Verification

No test suite — this is a presentation scaffold with mocked data and no logic worth
regression-testing. The gate is:

- `tsc --noEmit` — strict TypeScript
- `next build` — catches broken imports, invalid routes, and static-export violations
- Manual walkthrough of the approve flow, both themes, and every route at desktop and
  laptop widths

The README will state plainly that this is a demo scaffold and that the tool it models
carried ~120 test files, so the absent suite reads as scope, not as a gap.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Demo reads as a pretty shell | Source provenance, real cost figures, a working approve flow, and a run log containing failures |
| Timestamps go stale | Offset-based dates resolved at mount |
| State lost mid-interview | `resetDemo()` in the topbar; refresh also resets |
| Static export blocks a needed feature | No server features are in scope; verified by `next build` |
| Brand names imply integrations not actually built | README and interview framing describe the real tool's sources generically |
