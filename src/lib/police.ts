import type { Person } from "@/lib/feed";

/**
 * Nepal Police — Unidentified Bodies (udb.nepalpolice.gov.np). Recovered,
 * as-yet-unidentified flood victims: sex, place found, date/time, and the
 * facility holding the body. Grim but essential — families searching for a
 * missing relative need to be able to check these.
 *
 * Rendered as an HTML table; each row's description is a labelled blob. These
 * are their OWN "deceased" category (not missing/found) and are never
 * name-deduped (most share the name "unidentified").
 */

const LIST_URL = "https://udb.nepalpolice.gov.np/dead-bodies-lists";
const SITE = "https://udb.nepalpolice.gov.np";
const FETCH_TIMEOUT_MS = 9_000;
const TTL_MS = 15 * 60 * 1000;

const between = (s: string, a: string, b: string) => {
  const i = s.indexOf(a);
  if (i < 0) return "";
  const from = i + a.length;
  const j = b ? s.indexOf(b, from) : -1;
  return s.slice(from, j < 0 ? undefined : j).replace(/\s+/g, " ").trim();
};

export function parsePolice(html: string): Person[] {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/g) || [];
  const people: Person[] = [];
  rows.forEach((tr, i) => {
    const cells = tr.match(/<td[\s\S]*?<\/td>/g) || [];
    const blobCell = cells.find((c) => /नाम\s*:-/.test(c));
    if (!blobCell) return;
    const blob = blobCell
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const name0 = between(blob, "नाम:-", "लिङ्ग");
    const sex = between(blob, "लिङ्ग:-", "भेटिएको");
    const foundPlace = between(blob, "भेटिएको ठाउँ:-", "भेटिएको मिति");
    const when = between(blob, "भेटिएको मिति/समय:-", "हाल शव");
    const morgue = between(blob, "हाल शव राखेको स्थान:-", "");

    const href = (tr.match(/href="([^"]*(?:dead-bod|body|detail)[^"]*)"/i) || [])[1];
    const url = href
      ? href.startsWith("http")
        ? href
        : `${SITE}${href.startsWith("/") ? "" : "/"}${href}`
      : LIST_URL;

    const unknown = !name0 || /नखुलेको|अज्ञात|खुलेको छैन|unidentified/i.test(name0);

    people.push({
      id: `police-${i}`,
      name: unknown ? "अपरिचित शव · Unidentified body" : name0,
      place: foundPlace || undefined,
      when: when || undefined,
      note: [sex, morgue ? `शव राखिएको स्थान: ${morgue}` : ""]
        .filter(Boolean)
        .join(" · ") || undefined,
      country: "Nepal",
      rescueStatus: "अपरिचित शव भेटिएको",
      source: { label: "Nepal Police — Unidentified Bodies", url },
      status: "deceased",
    });
  });
  return people;
}

let cache: { people: Person[]; at: number } | null = null;
let inflight: Promise<Person[]> | null = null;

async function fetchAll(): Promise<Person[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(LIST_URL, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "user-agent": "Mozilla/5.0 (compatible; NepalFloodSearch/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const people = parsePolice(await res.text());
    if (people.length) cache = { people, at: Date.now() };
    return people;
  } finally {
    clearTimeout(timer);
  }
}

export async function getPoliceBodies(): Promise<Person[]> {
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
