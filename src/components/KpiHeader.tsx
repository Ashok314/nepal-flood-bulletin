import type { Lang, Messages } from "@/lib/i18n";
import type { Kpis } from "@/lib/metrics";

function Stat({
  value,
  label,
  tone,
  sub,
}: {
  value: string | number;
  label: string;
  tone: "rose" | "emerald" | "blue" | "slate" | "amber" | "red" | "indigo";
  sub?: string;
}) {
  const toneMap: Record<string, string> = {
    rose: "text-rose-700",
    emerald: "text-emerald-700",
    blue: "text-blue-700",
    slate: "text-slate-800",
    amber: "text-amber-700",
    red: "text-red-700",
    indigo: "text-indigo-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`text-2xl font-extrabold leading-none ${toneMap[tone]}`}>
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

export default function KpiHeader({
  m,
  kpis,
  official,
}: {
  lang: Lang;
  m: Messages;
  kpis: Kpis;
  official?: { rescued: number; missing: number };
}) {
  // NDRRMA's official rescued total runs ahead of what we can make searchable
  // (some records have no published name). Show the official number, with the
  // searchable count as context.
  const rescuedOfficial = official?.rescued ?? 0;
  const rescuedValue = Math.max(rescuedOfficial, kpis.rescued);
  const rescuedSub =
    rescuedOfficial > kpis.rescued
      ? `${kpis.rescued.toLocaleString()} ${m.searchableHere}`
      : undefined;
  const riverTone = kpis.rivers.anyDanger
    ? "red"
    : kpis.rivers.aboveWarning > 0
      ? "amber"
      : "emerald";

  return (
    <section id="overview" className="scroll-mt-16 border-b border-slate-200 bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          {m.kpiTitle}
        </h2>

        {/* Only show a card when we actually have data for it — a lone "0"
            reads as broken, not informative. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.missing > 0 && (
            <Stat value={kpis.missing.toLocaleString()} label={m.kpiStillMissing} tone="rose" />
          )}
          {rescuedValue > 0 && (
            <Stat
              value={rescuedValue.toLocaleString()}
              label={m.kpiRescued}
              tone="emerald"
              sub={rescuedSub}
            />
          )}
          {kpis.missing + kpis.rescued > 0 && (
            <Stat value={`${kpis.accountedPct}%`} label={m.kpiAccounted} tone="slate" />
          )}
          {kpis.reunited > 0 && (
            <Stat value={kpis.reunited.toLocaleString()} label={m.kpiReunited} tone="blue" />
          )}
          {kpis.new24h > 0 && (
            <Stat value={kpis.new24h.toLocaleString()} label={m.kpiNew24h} tone="amber" />
          )}
          {kpis.rivers.aboveWarning > 0 && (
            <Stat
              value={kpis.rivers.aboveWarning}
              label={m.kpiRiversWarn}
              tone={riverTone}
              sub={
                kpis.rivers.aboveDanger > 0
                  ? `${kpis.rivers.aboveDanger} ${m.riverDanger.toLowerCase()}`
                  : undefined
              }
            />
          )}
          {kpis.affectedDistricts > 0 && (
            <Stat value={kpis.affectedDistricts} label={m.kpiDistricts} tone="indigo" />
          )}
        </div>

        {/* Vulnerability line — only the parts we actually have */}
        {(kpis.vulnerable.minors > 0 ||
          kpis.vulnerable.elderly > 0 ||
          kpis.vulnerable.foreign > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="font-medium text-slate-500">{m.kpiOfMissing}:</span>
            {kpis.vulnerable.minors > 0 && (
              <span>
                <b className="text-slate-800">{kpis.vulnerable.minors}</b> {m.kpiMinors}
              </span>
            )}
            {kpis.vulnerable.elderly > 0 && (
              <span>
                <b className="text-slate-800">{kpis.vulnerable.elderly}</b> {m.kpiElderly}
              </span>
            )}
            {kpis.vulnerable.foreign > 0 && (
              <span>
                <b className="text-slate-800">{kpis.vulnerable.foreign}</b> {m.kpiForeign}
              </span>
            )}
            {kpis.topDistricts.length > 0 && (
              <span className="text-slate-400">
                · {kpis.topDistricts.map((d) => `${d.name} (${d.count})`).join(" · ")}
              </span>
            )}
          </div>
        )}

        {(kpis.vulnerable.foreign > 0 || kpis.freshness.feedMinutes != null) && (
          <div className="mt-2 flex flex-wrap gap-x-4 text-[11px] text-slate-400">
            {kpis.vulnerable.foreign > 0 && <span>{m.kpiForeignNote}</span>}
            {kpis.freshness.feedMinutes != null && (
              <span>
                {m.updatedAt}: {kpis.freshness.feedMinutes} {m.minAgo}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
