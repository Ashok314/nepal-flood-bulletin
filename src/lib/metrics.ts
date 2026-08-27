import type { NormalizedFeed } from "@/lib/feed";
import type { RiversData } from "@/lib/rivers";
import { personTags, personDistrict, parseReportTime } from "@/lib/derive";

export type Kpis = {
  missing: number;
  rescued: number;
  reunited: number;
  accountedPct: number;
  new24h: number;
  vulnerable: { minors: number; elderly: number; foreign: number };
  affectedDistricts: number;
  topDistricts: { name: string; count: number }[];
  rivers: {
    aboveWarning: number;
    aboveDanger: number;
    anyDanger: boolean;
    maxPctToDanger: number | null;
  };
  freshness: { feedMinutes: number | null; riverMinutes: number | null };
};

function minutesSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((Date.now() - t) / 60000));
}

export function deriveKpis(feed: NormalizedFeed, rivers: RiversData): Kpis {
  const missing = feed.counts.missing;
  const rescued = feed.counts.found;
  const reunited = feed.matchedCount;
  const totalCases = missing + rescued + reunited;
  const accounted = rescued + reunited;
  const accountedPct = totalCases ? Math.round((accounted / totalCases) * 100) : 0;

  const cutoff = Date.now() - 24 * 3600 * 1000;
  let new24h = 0;
  for (const p of [...feed.missing, ...feed.found]) {
    const t = parseReportTime(p.id);
    if (t && t.getTime() >= cutoff) new24h++;
  }

  let minors = 0;
  let elderly = 0;
  let foreign = 0;
  const districtCounts = new Map<string, number>();
  for (const p of feed.missing) {
    const tags = personTags(p);
    if (tags.minor) minors++;
    if (tags.elderly) elderly++;
    if (tags.foreign) foreign++;
    const d = personDistrict(p);
    if (d) districtCounts.set(d, (districtCounts.get(d) || 0) + 1);
  }
  const topDistricts = [...districtCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    missing,
    rescued,
    reunited,
    accountedPct,
    new24h,
    vulnerable: { minors, elderly, foreign },
    affectedDistricts: districtCounts.size,
    topDistricts: topDistricts.slice(0, 6),
    rivers: {
      aboveWarning: rivers.summary.aboveWarning,
      aboveDanger: rivers.summary.danger,
      anyDanger: rivers.summary.anyDanger,
      maxPctToDanger: rivers.summary.maxPctToDanger,
    },
    freshness: {
      feedMinutes: minutesSince(feed.updatedAt || feed.fetchedAt),
      riverMinutes: minutesSince(rivers.updatedAt || rivers.fetchedAt),
    },
  };
}
