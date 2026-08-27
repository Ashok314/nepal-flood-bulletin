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
