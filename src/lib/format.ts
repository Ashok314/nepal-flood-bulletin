import type { Lang } from "@/lib/i18n";

/** Format an ISO timestamp in Nepal time, tolerant of bad input. */
export function formatDateTime(iso: string | null, lang: Lang): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(lang === "ne" ? "ne-NP" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kathmandu",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

/** Relative time like "3h ago" / "2d ago", tolerant of bad input. */
export function timeAgo(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return lang === "ne" ? "भर्खरै" : "just now";
  if (mins < 60) return lang === "ne" ? `${mins} मिनेट अघि` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === "ne" ? `${hrs} घण्टा अघि` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return lang === "ne" ? `${days} दिन अघि` : `${days}d ago`;
}

/** Split a free-form phone string ("98… / 98…") into individual numbers. */
export function splitPhones(phone?: string): string[] {
  if (!phone) return [];
  return phone
    .split(/[/,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Keep only characters valid inside a tel: URI. */
export function telHref(num: string): string {
  return "tel:" + num.replace(/[^+\d]/g, "");
}
