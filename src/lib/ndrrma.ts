import type { Person } from "@/lib/feed";
import { detectCountry } from "@/lib/derive";

/**
 * Live official rescued-persons data from NDRRMA's public API. Clean, structured
 * JSON (unlike the corrupted PDF), fetched server-side and cached in memory.
 * These populate the "Rescued & safe" list, each tagged with the NDRRMA source.
 */

const API = "https://ndrrma.gov.np/api/v1/rescues/rescued-persons/?limit=-1";
const SOURCE = { label: "NDRRMA", url: "https://ndrrma.gov.np/np/misc-report/380" };

const TTL_MS = 10 * 60 * 1000;
const MIN_GAP_MS = 60_000;
const TIMEOUT_MS = 10_000;

let cache: { people: Person[]; at: number } | null = null;
let lastAttempt = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(rows: any[]): Person[] {
  return rows.map((r) => {
    const nameEn = String(r?.name ?? "").trim();
    const nameNe = String(r?.name_ne ?? "").trim();
    const display = nameNe || nameEn || "-";
    const loc = r?.rescued_location ?? {};
    const place = String(loc?.title_ne || loc?.title || "").trim() || undefined;

    const natRaw = String(r?.nationality ?? "").trim().toLowerCase();
    const remarks = String(r?.remarks ?? "").trim();
    let country: string | undefined;
    if (r?.country) country = String(r.country).trim();
    else if (natRaw === "nepali") country = "Nepal";
    else if (natRaw === "foreign")
      country = detectCountry([nameEn, nameNe, remarks].join(" ")) ?? "Foreign";

    const parts: string[] = [];
    if (r?.rescued_date) parts.push(`Rescued ${r.rescued_date}`);
    if (r?.status?.title) parts.push(String(r.status.title));
    if (country && country !== "Nepal") parts.push(country);
    if (remarks) parts.push(remarks);

    return {
      id: `ndrrma-${r?.id ?? Math.random().toString(36).slice(2)}`,
      name: display,
      nameEn: nameEn && nameEn !== display ? nameEn : undefined,
      place,
      age: r?.age != null ? String(r.age) : undefined,
      note: parts.join(" · ") || undefined,
      source: SOURCE,
      country,
      status: "found" as const,
    };
  });
}

export async function getNdrrmaRescued(): Promise<Person[]> {
  const stale = !cache || Date.now() - cache.at > TTL_MS;
  if (cache && !stale) return cache.people;
  if (cache && stale && Date.now() - lastAttempt < MIN_GAP_MS) return cache.people;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  lastAttempt = Date.now();
  try {
    const res = await fetch(API, {
      signal: controller.signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json)
        ? json
        : [];
    const people = normalize(rows);
    cache = { people, at: Date.now() };
    return people;
  } catch {
    return cache?.people ?? [];
  } finally {
    clearTimeout(timer);
  }
}
