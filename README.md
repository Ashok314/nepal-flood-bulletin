# Nepal Flood — Rescue & Relief Bulletin

A people-focused landing page for the Nepal (Rasuwa) flood: **search & rescue**
(missing / rescued people), **need-attention** listings, live **updates from the
source repo**, **emergency relief** info, and **informational** PM Relief Fund
details — with a small optional **admin** panel.

Data is mirrored live from the community bulletin's public JSON feed. The app
**never invents or edits** entries; it caches the last good snapshot and applies
an admin moderation overlay on top.

## 🙏 Credits

The underlying data and the original bulletin are the work of
**[Niraj Bhusal](https://github.com/nirajbhusal)** —
[Rasuwa Flood Bulletin](https://nirajbhusal.github.io/rasuwa-flood-bulletin/).
This project is an enhanced front end built on top of that public data feed and
the live **DHM** hydrology feed. **Full credit to the original author.** River
levels are sourced from Nepal's Department of Hydrology & Meteorology (DHM);
maps use OpenStreetMap.

## Features

- **Search & Rescue** — searchable "Need attention" (missing) and
  "Rescued & safe" (found) lists from the live feed. Search by name / place / phone.
- **Report** buttons that deep-link to the official Google Forms.
- **Official updates** — human-verified curated links/posts from official handles.
- **Emergency relief** — hotlines, report forms, resource links.
- **Support & Donation** — PM Relief Fund, informational only (no payments).
- **Bilingual** UI (English / नेपाली).
- **Admin panel** (`/admin`) — manage curated posts, feed source + refresh,
  and hide/flag feed entries.
- **Resilient** — dual-source failover (GitHub Pages + `raw.githubusercontent`)
  and serves the last cached snapshot if the upstream source is down.
- **Live updates** — a feed of the source repo's recent commits so you can see
  what just changed (new reports, corrections) in near real time.

## Deploy to Vercel (free tier)

The public site runs on Vercel with **no database** — the flood feed and river
data are fetched at request time and cached in memory, so nothing needs a
writable disk. Just import the repo into Vercel and deploy; the default build
(`prisma generate && next build`) works as-is.

- **No `DATABASE_URL` needed** for the public site. (SQLite can't be used on
  Vercel — its filesystem is read-only.)
- The **admin panel** (curated posts + moderation) needs a hosted database.
  To enable it, attach a serverless DB — **[Neon](https://neon.tech)** Postgres
  or **[Turso](https://turso.tech)** (libSQL/SQLite) both have free tiers — set
  `DATABASE_URL` (and `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET`) in
  Vercel's env, and switch the Prisma `datasource` provider accordingly. Without
  it, admin routes return `503` and the public site is unaffected.

## Local development

```bash
cp .env.example .env
npm install
npx prisma db push   # optional — only needed for the admin panel
npm run dev
```

## Before going live — data integrity checklist

- [ ] Fill **verified** PM Relief Fund details in `src/lib/config.ts`
      (`DONATION`) and set `verified: true`. Until then the page shows a
      "pending verification" warning instead of account numbers.
- [ ] Confirm the **emergency hotline numbers** in `src/lib/config.ts`.
- [ ] Review the **feed source URL** in the admin panel.
- [ ] This is an **unofficial** community mirror — the footer says so; keep it.

## Configuration

| Variable          | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `DATABASE_URL`    | Optional — enables the admin panel (local SQLite or hosted DB) |
| `ADMIN_USER`      | Admin username                                      |
| `ADMIN_PASSWORD`  | Admin password                                      |
| `SESSION_SECRET`  | Secret for signing the admin session cookie         |
| `COOKIE_SECURE`   | `"true"` only when served over HTTPS                |

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind · Leaflet · Prisma (optional) · jose (auth).
