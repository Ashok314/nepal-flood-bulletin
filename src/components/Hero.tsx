import LanguageToggle from "./LanguageToggle";
import NepalFlag from "./NepalFlag";
import type { Lang, Messages } from "@/lib/i18n";
import { SITE, HOTLINES } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { telHref } from "@/lib/format";

const NAV = [
  { href: "#rivers", key: "riverTitle" as const },
  { href: "#map", key: "mapTitle" as const },
  { href: "#search-rescue", key: "srTitle" as const },
  { href: "#updates", key: "updatesTitle" as const },
  { href: "#help", key: "emergencyRelief" as const },
  { href: "#donate", key: "donationTitle" as const },
];

export default function Hero({
  lang,
  m,
  meta,
  counts,
}: {
  lang: Lang;
  m: Messages;
  meta: {
    updatedAt: string | null;
    sheetUrl: string | null;
    stale: boolean;
  };
  counts: { missing: number; found: number };
}) {
  return (
    <header>
      {/* Sticky nav bar */}
      <div className="sticky top-0 z-30 border-b border-brand-dark/40 bg-brand-dark/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
            <NepalFlag className="h-5 w-auto drop-shadow-sm" />
            {lang === "ne" ? "नेपाल बाढी" : "Nepal Flood"}
          </span>
          <nav className="hidden gap-4 overflow-x-auto md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="whitespace-nowrap text-sm text-white/80 hover:text-white"
              >
                {m[n.key]}
              </a>
            ))}
          </nav>
          <div className="ml-auto">
            <LanguageToggle lang={lang} m={m} />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-b from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {SITE.event}
          </span>
          <div className="mt-3 flex items-center gap-3">
            <NepalFlag className="h-11 w-auto shrink-0 drop-shadow-md" />
            <h1 className="text-3xl font-bold sm:text-4xl">
              {lang === "ne" ? "नेपाल बाढी" : "Nepal Flood"} —{" "}
              <span className="font-medium">{m.siteTagline}</span>
            </h1>
          </div>

          <p className="mt-2 text-sm text-white/80">
            {m.updatedAt}: {formatDateTime(meta.updatedAt, lang)}
            {meta.sheetUrl && (
              <>
                {" · "}
                <a
                  href={meta.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {m.source}
                </a>
              </>
            )}
          </p>

          {meta.stale && (
            <p className="mt-3 rounded-md bg-amber-400/20 px-3 py-2 text-sm text-amber-50 ring-1 ring-amber-200/40">
              ⚠ {m.sourceUnreachable}
            </p>
          )}

          {/* Status summary chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="#search-rescue"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/20 hover:bg-white/20"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-rose-300" />
              {m.needAttentionChip}
              <span className="font-bold">{counts.missing}</span>
            </a>
            <a
              href="#search-rescue"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/20 hover:bg-white/20"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
              {m.rescuedChip}
              <span className="font-bold">{counts.found}</span>
            </a>
            <a
              href="#search-rescue"
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/20 hover:bg-white/20"
            >
              🔎 {m.searchByName}
            </a>
          </div>

          {/* Emergency hotlines */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              {m.emergency}
            </p>
            <div className="flex flex-wrap gap-2">
              {HOTLINES.map((h) => (
                <a
                  key={h.number}
                  href={telHref(h.number)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium ring-1 ring-white/20 hover:bg-white/20"
                >
                  {lang === "ne" ? h.label_ne : h.label_en}:{" "}
                  <span className="font-bold">{h.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
