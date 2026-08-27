import { z } from "zod";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/config";

// ---------- Upstream JSON schema (kept lenient; we never reject the whole feed
// because one entry is odd) ----------

// The upstream sheet emits `null` for empty cells (not just missing keys), so
// every field is `.nullish()` (accepts string | null | undefined). Nulls are
// coerced to undefined in normalizeEntry below.
const EntrySchema = z
  .object({
    id: z.string().nullish(),
    name: z.string().nullish(),
    place: z.string().nullish(),
    phone: z.string().nullish(),
    age: z
      .union([z.string(), z.number()])
      .nullish()
      .transform((v) => (v == null ? undefined : String(v))),
    when: z.string().nullish(),
    note: z.string().nullish(),
    name_en: z.string().nullish(),
    photo: z.string().nullish(),
    reporter: z.string().nullish(),
  })
  .passthrough();

const FeedSchema = z
  .object({
    updated_at: z.string().nullish(),
    sheet: z.string().nullish(),
    responses_sheet: z.string().nullish(),
    forms: z
      .object({ missing: z.string().nullish(), found: z.string().nullish() })
      .partial()
      .passthrough()
      .nullish(),
    missing: z.array(EntrySchema).optional().default([]),
    found: z.array(EntrySchema).optional().default([]),
    matched: z.array(EntrySchema).optional().default([]),
  })
  .passthrough();

export type RawEntry = z.infer<typeof EntrySchema>;

// ---------- Normalized types used by the UI ----------

export type PersonStatus = "missing" | "found";

export type Person = {
  id: string;
  name: string;
  nameEn?: string;
  place?: string;
  phone?: string;
  age?: string;
  when?: string;
  note?: string;
  photo?: string;
  status: PersonStatus;
  flagged?: boolean;
};

export type NormalizedFeed = {
  updatedAt: string | null; // upstream `updated_at`
  fetchedAt: string | null; // when we last successfully fetched
  sheetUrl: string | null;
  forms: { missing: string | null; found: string | null };
  missing: Person[];
  found: Person[];
  matchedCount: number; // reunited (missing -> found) pairs, from upstream
  counts: { missing: number; found: number };
  status: "ok" | "error" | "never";
  sourceUrl: string;
  stale: boolean; // serving cached data while the live source is failing
};

// ---------- In-memory caches (per running server process) ----------

let parsedCache: { payload: string; feed: z.infer<typeof FeedSchema> } | null =
  null;
let lastAttemptMs = 0;
const MIN_ATTEMPT_GAP_MS = 30_000; // throttle background refetch attempts
const FETCH_TIMEOUT_MS = 8_000;

// ---------- Config singleton ----------

export async function getFeedConfig() {
  return prisma.feedConfig.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      feedUrl: SITE.defaultFeedUrl,
      backupFeedUrl: SITE.backupFeedUrl,
    },
    update: {},
  });
}

// ---------- Fetch + cache ----------

async function fetchJson(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch the upstream feed, validate it, and store the snapshot. Throws on failure. */
export async function fetchAndCache(): Promise<void> {
  const cfg = await getFeedConfig();
  lastAttemptMs = Date.now();
  try {
    const text = await fetchJson(cfg.feedUrl);
    const json = JSON.parse(text);
    FeedSchema.parse(json); // validate shape; throws if wildly wrong
    await prisma.feedConfig.update({
      where: { id: 1 },
      data: {
        lastGoodPayload: text,
        lastFetchedAt: new Date(),
        lastStatus: "ok",
        lastError: "",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.feedConfig.update({
      where: { id: 1 },
      data: { lastStatus: "error", lastError: message },
    });
    throw err;
  }
}

function maybeBackgroundRefresh() {
  if (Date.now() - lastAttemptMs < MIN_ATTEMPT_GAP_MS) return;
  // Fire and forget — the running server process lives long enough to finish it,
  // and the fresh snapshot is picked up on the next request.
  void fetchAndCache().catch(() => {
    /* already recorded on FeedConfig */
  });
}

// ---------- Moderation overlay ----------

async function getModerationMap(): Promise<Map<string, string>> {
  const flags = await prisma.moderationFlag.findMany();
  return new Map(flags.map((f) => [f.entryId, f.action]));
}

function normalizeEntry(
  raw: RawEntry,
  index: number,
  status: PersonStatus,
): Person {
  return {
    id: raw.id ?? `${status}-${index}-${(raw.name || "unknown").slice(0, 24)}`,
    name: raw.name || "—",
    nameEn: raw.name_en ?? undefined,
    place: raw.place ?? undefined,
    phone: raw.phone ?? undefined,
    age: raw.age ?? undefined,
    when: raw.when ?? undefined,
    note: raw.note ?? undefined,
    photo: raw.photo ?? undefined,
    status,
  };
}

function applyModeration(people: Person[], mod: Map<string, string>): Person[] {
  const out: Person[] = [];
  for (const p of people) {
    const action = mod.get(p.id);
    if (action === "hide") continue;
    out.push(action === "flag" ? { ...p, flagged: true } : p);
  }
  return out;
}

// ---------- Public read API ----------

export async function getFeed(): Promise<NormalizedFeed> {
  let cfg = await getFeedConfig();

  const hasSnapshot = cfg.lastGoodPayload !== "";
  const ageMs = cfg.lastFetchedAt
    ? Date.now() - cfg.lastFetchedAt.getTime()
    : Infinity;
  const isStale = ageMs / 1000 > cfg.refreshInterval;

  if (!hasSnapshot) {
    // First ever load: block on a fetch so the page isn't empty.
    try {
      await fetchAndCache();
      cfg = await getFeedConfig();
    } catch {
      /* fall through to empty feed below */
    }
  } else if (isStale) {
    maybeBackgroundRefresh();
  }

  const mod = await getModerationMap();
  const empty: NormalizedFeed = {
    updatedAt: null,
    fetchedAt: cfg.lastFetchedAt ? cfg.lastFetchedAt.toISOString() : null,
    sheetUrl: null,
    forms: { missing: null, found: null },
    missing: [],
    found: [],
    matchedCount: 0,
    counts: { missing: 0, found: 0 },
    status: cfg.lastStatus as NormalizedFeed["status"],
    sourceUrl: cfg.feedUrl,
    stale: cfg.lastStatus === "error",
  };

  if (cfg.lastGoodPayload === "") return empty;

  let feed: z.infer<typeof FeedSchema>;
  if (parsedCache && parsedCache.payload === cfg.lastGoodPayload) {
    feed = parsedCache.feed;
  } else {
    try {
      feed = FeedSchema.parse(JSON.parse(cfg.lastGoodPayload));
      parsedCache = { payload: cfg.lastGoodPayload, feed };
    } catch {
      return empty;
    }
  }

  const missing = applyModeration(
    feed.missing.map((e, i) => normalizeEntry(e, i, "missing")),
    mod,
  );
  const found = applyModeration(
    feed.found.map((e, i) => normalizeEntry(e, i, "found")),
    mod,
  );

  return {
    updatedAt: feed.updated_at ?? null,
    fetchedAt: cfg.lastFetchedAt ? cfg.lastFetchedAt.toISOString() : null,
    sheetUrl: feed.sheet ?? null,
    forms: {
      missing: feed.forms?.missing ?? null,
      found: feed.forms?.found ?? null,
    },
    missing,
    found,
    matchedCount: feed.matched.length,
    counts: { missing: missing.length, found: found.length },
    status: cfg.lastStatus as NormalizedFeed["status"],
    sourceUrl: cfg.feedUrl,
    stale: cfg.lastStatus === "error" && hasSnapshot,
  };
}

/**
 * All entries from the cached snapshot WITHOUT the moderation overlay applied.
 * Used by the admin panel so hidden entries can still be seen and un-hidden.
 */
export async function getAllEntriesRaw(): Promise<Person[]> {
  const cfg = await getFeedConfig();
  if (cfg.lastGoodPayload === "") return [];
  let feed: z.infer<typeof FeedSchema>;
  try {
    feed = FeedSchema.parse(JSON.parse(cfg.lastGoodPayload));
  } catch {
    return [];
  }
  return [
    ...feed.missing.map((e, i) => normalizeEntry(e, i, "missing")),
    ...feed.found.map((e, i) => normalizeEntry(e, i, "found")),
  ];
}
