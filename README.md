# Nepal Flood Rescue & Relief Bulletin

A people-focused site for the Nepal (Rasuwa) flood, built purely for
**awareness and clean information**. It presents public information clearly to
help spread awareness and help people **search for and find the missing**: a
searchable list of missing and rescued people, live updates from the source,
river early-warning, emergency contacts, and an official PM Relief Fund donate
link.

This is an **unofficial mirror for awareness and information only**. It is not a
rescue authority and is not affiliated with any government body. No database, no
login, no admin. The site fetches the community bulletin's live JSON feed at
request time and caches it in memory, and **never invents or edits** entries.
Always verify critical details independently before acting.

## 🙏 Credits

The underlying data and the original bulletin are the work of
**[Niraj Bhusal](https://github.com/nirajbhusal)** /
[Rasuwa Flood Bulletin](https://nirajbhusal.github.io/rasuwa-flood-bulletin/).
**Full credit to the original author.** We only mirror the people data to help.
River levels come from Nepal's Department of Hydrology & Meteorology (DHM).

## Features

- **Search & Rescue** (first thing you see): searchable "Need attention"
  (missing) and "Rescued & safe" (found) lists. Search by name, place, or phone,
  with paginated cards showing photo, age, last-seen, contacts, and "reported X ago".
- **Report** buttons that deep-link to the official Google Forms.
- **Live updates**: a collapsible side panel of the source repo's recent commits,
  so you can see what just changed (new reports, corrections) in near real time.
- **River Watch**: live DHM gauges with warning/danger levels and a danger alert.
- **Emergency relief**: hotlines and resource links.
- **Support & Donation**: opens the official PM Disaster Relief Fund portal
  (`pmdrf.nchl.com.np`); the click is tracked via Vercel Analytics.
- **Bilingual** UI (English / नेपाली).
- **Resilient**: dual-source failover (GitHub Pages + `raw.githubusercontent`),
  serving the last cached snapshot if the upstream source is briefly down.

## Deploy to Vercel

The site needs **no environment variables and no database**. Import the repo into
Vercel and deploy; the default build (`next build`) just works.

## Local development

```bash
npm install
npm run dev
```

## Before going live

- [ ] Confirm the **PM Relief Fund portal URL** and **emergency hotline numbers**
      in `src/lib/config.ts`.
- [ ] This is an **unofficial** community mirror; the footer says so, keep it.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind · Vercel Analytics.
