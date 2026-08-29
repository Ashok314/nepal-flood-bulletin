import type { Person } from "@/lib/feed";

/**
 * NDRRMA SETU — "Rescued & Missing Persons (Rasuwa Flood)". The official,
 * person-level reconciliation registry: name, age, sex, location, status
 * (Missing / Found-Safe / Rescued) and the reporting District Admin Office.
 *
 * Server-rendered as paginated HTML cards (recordlist.php?page=N). We fetch
 * every page, parse the cards, and cache in-memory; each card deep-links back
 * to a SETU name search as its source.
 */

const BASE = "https://setu.ndrrma.gov.np/admin/recordlist.php";
const FETCH_TIMEOUT_MS = 9_000;
const TTL_MS = 10 * 60 * 1000;
const MAX_PAGES = 40; // safety cap against a runaway pager

const pick = (s: string, re: RegExp) => {
  const m = s.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
};

export function parseSetuPage(html: string, page: number): Person[] {
  const segments = html.split(/<div class="rl" data-i="/).slice(1);
  const people: Person[] = [];
  segments.forEach((seg, i) => {
    const name = pick(seg, /rl-name">([^<]*)</);
    if (!name || name.length < 2) return;
    const status = pick(seg, /class="pill"[^>]*>([^<]*)</);
    if (!status || status.includes("esc(")) return; // skip a template artifact
    const ag = pick(seg, /rl-ag">([^<]*)</); // "Age 11 years · Male"
    const loc = pick(seg, /rl-loc">([^<]*)</);
    const src = pick(seg, /class="src">([^<]*)</); // reporting DAO
    const when = pick(seg, /class="when">([^<]*)</);

    const age = (ag.match(/(\d+)\s*(?:year|माह|month|महिना|वर्ष)/i) || ag.match(/(\d+)/) || [])[1] || "";
    const sex = (ag.match(/·\s*([A-Za-zऀ-ॿ]+)/) || [])[1] || "";
    const isFound = /found|safe|rescu/i.test(status);

    people.push({
      id: `setu-${page}-${i}`,
      name,
      age: age || undefined,
      place: loc || undefined,
      note: [sex, src].filter(Boolean).join(" · ") || undefined,
      when: when || undefined,
      country: "Nepal",
      rescueStatus: isFound ? (/rescu/i.test(status) ? "Rescued" : "Safe") : undefined,
      source: { label: "NDRRMA SETU", url: `${BASE}?q=${encodeURIComponent(name)}` },
      status: isFound ? "found" : "missing",
    });
  });
  return people;
}

function lastPageOf(html: string): number {
  return Math.max(
    1,
    ...[...html.matchAll(/recordlist\.php\?page=(\d+)/g)].map((m) => Number(m[1])),
  );
}

async function fetchPage(page: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}?page=${page}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

let cache: { people: Person[]; at: number } | null = null;
let inflight: Promise<Person[]> | null = null;

async function fetchAll(): Promise<Person[]> {
  const first = await fetchPage(1);
  const last = Math.min(lastPageOf(first), MAX_PAGES);
  const people = parseSetuPage(first, 1);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, last - 1) }, (_, i) =>
      fetchPage(i + 2)
        .then((html) => parseSetuPage(html, i + 2))
        .catch(() => [] as Person[]),
    ),
  );
  const all = people.concat(...rest);
  if (all.length) cache = { people: all, at: Date.now() };
  return all;
}

export async function getSetuPeople(): Promise<Person[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.people;
  if (!inflight) {
    inflight = fetchAll()
      .catch(() => cache?.people ?? [])
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}
