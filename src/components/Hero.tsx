import LanguageToggle from "./LanguageToggle";
import NepalFlag from "./NepalFlag";
import HeroSearch from "./HeroSearch";
import RollingCount from "./RollingCount";
import type { Lang, Messages } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";

const NAV = [
  { href: "#search-rescue", key: "navSearch" as const },
  { href: "#overview", key: "navOverview" as const },
  { href: "#help", key: "navEmergency" as const },
  { href: "#donate", key: "navDonate" as const },
];

export default function Hero({
  lang,
  m,
  meta,
  counts,
  forms,
}: {
  lang: Lang;
  m: Messages;
  meta: {
    updatedAt: string | null;
    sheetUrl: string | null;
    stale: boolean;
  };
  counts: { missing: number; found: number };
  forms: { missing: string | null; found: string | null };
}) {
  const total = counts.missing + counts.found;

  return (
    <header>
      {/* Sticky nav bar */}
      <div className="sticky top-0 z-30 border-b border-brand-dark/40 bg-brand-dark/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <a
            href="#top"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white"
          >
            <NepalFlag className="h-5 w-auto drop-shadow-sm" />
            {lang === "ne" ? "नेपाल बाढी" : "Nepal Flood"}
          </a>
          <nav className="hidden gap-5 overflow-x-auto md:flex">
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

      {/* Search-first hero */}
      <div className="bg-gradient-to-b from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:py-12">
          <span className="inline-block rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15">
            {m.heroScope}
          </span>

          <h1 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight sm:mt-4 sm:text-5xl">
            {m.heroTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-xs text-white/75 sm:mt-3 sm:text-base">
            {m.heroSubtitle}
          </p>

          {/* The search box (drives the results list below) */}
          <div className="mt-4 max-w-4xl sm:mt-6">
            <HeroSearch m={m} />
          </div>

          {/* Live-sync status */}
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/75 sm:mt-4">
            {meta.stale ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                {m.sourceUnreachable}
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  <span className="hidden sm:inline">{m.heroLiveSynced}</span>
                </span>
                {meta.updatedAt && (
                  <>
                    <span className="hidden text-white/40 sm:inline">·</span>
                    <span>
                      {m.heroLastSynced}:{" "}
                      <strong className="font-semibold text-white/90">
                        {formatDateTime(meta.updatedAt, lang)}
                      </strong>
                    </span>
                  </>
                )}
              </>
            )}
            <span className="text-white/40">·</span>
            <a href="#help" className="underline decoration-white/40 hover:text-white">
              {m.heroHowItWorks} →
            </a>
          </p>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {forms.missing && (
              <a
                href={forms.missing}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold sm:px-4 text-brand-dark shadow-sm hover:bg-white/90"
              >
                + {m.heroReportMissing}
              </a>
            )}
            {forms.found && (
              <a
                href={forms.found}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold sm:px-4 text-white ring-1 ring-white/25 hover:bg-white/25"
              >
                ✓ {m.heroMarkFound}
              </a>
            )}
            <a
              href="#help"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold sm:px-4 text-white/90 ring-1 ring-white/20 hover:bg-white/20"
            >
              {m.heroEmergencyBtn}
            </a>
          </div>

          {/* Counts */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
            <span>
              <RollingCount value={counts.missing} className="font-bold text-white" />{" "}
              {m.statMissing}
            </span>
            <span>
              <RollingCount value={counts.found} className="font-bold text-white" />{" "}
              {m.statFound}
            </span>
            <span>
              <RollingCount value={total} className="font-bold text-white" />{" "}
              {m.statTracked}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
