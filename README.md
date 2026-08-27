# Nepal Flood — Rescue & Relief Bulletin

A dockerized landing page for the Nepal (Rasuwa) flood: **search & rescue**
(missing / rescued people), **need-attention** listings, **emergency relief**
info, **official updates**, and **informational** PM Relief Fund details — with
a small **admin** panel.

Data is mirrored from a public community JSON feed
(Google Sheets → published JSON). The app **never invents or edits** entries;
it caches the last good snapshot and applies an admin moderation overlay on top.

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
- **Resilient** — serves the last cached snapshot if the upstream source is down.

## Run with Docker (recommended)

```bash
docker compose up --build
```

Then open:

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (default `admin` / `changeme`)

> **Change `ADMIN_PASSWORD` and `SESSION_SECRET` in `docker-compose.yml`
> before any real deployment.**

Data (SQLite DB + cached feed) persists in the `angel-data` Docker volume.

## Local development (without Docker)

```bash
cp .env.example .env
npm install
npx prisma db push
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
| `DATABASE_URL`    | SQLite path (Docker: `file:/data/app.db`)           |
| `ADMIN_USER`      | Admin username                                      |
| `ADMIN_PASSWORD`  | Admin password                                      |
| `SESSION_SECRET`  | Secret for signing the admin session cookie         |
| `COOKIE_SECURE`   | `"true"` only when served over HTTPS                |

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + SQLite · jose (auth).
