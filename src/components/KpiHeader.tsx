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
}: {
  lang: Lang;
  m: Messages;
  kpis: Kpis;
}) {
  const riverTone = kpis.rivers.anyDanger
    ? "red"
    : kpis.rivers.aboveWarning > 0
      ? "amber"
      : "emerald";

  return (
    <section id="overview" className="border-b border-slate-200 bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          {m.kpiTitle}
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <Stat value={kpis.missing.toLocaleString()} label={m.kpiStillMissing} tone="rose" />
          <Stat value={kpis.rescued.toLocaleString()} label={m.kpiRescued} tone="emerald" />
          <Stat value={kpis.reunited.toLocaleString()} label={m.kpiReunited} tone="blue" />
          <Stat value={`${kpis.accountedPct}%`} label={m.kpiAccounted} tone="slate" />
          <Stat value={kpis.new24h.toLocaleString()} label={m.kpiNew24h} tone="amber" />
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
          <Stat value={kpis.affectedDistricts} label={m.kpiDistricts} tone="indigo" />
        </div>

        {/* Vulnerability line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="font-medium text-slate-500">{m.kpiOfMissing}:</span>
          <span>
            <b className="text-slate-800">{kpis.vulnerable.minors}</b> {m.kpiMinors}
          </span>
          <span>
            <b className="text-slate-800">{kpis.vulnerable.elderly}</b> {m.kpiElderly}
          </span>
          <span>
            <b className="text-slate-800">{kpis.vulnerable.foreign}</b> {m.kpiForeign}
          </span>
          {kpis.topDistricts.length > 0 && (
            <span className="text-slate-400">
              · {kpis.topDistricts.map((d) => `${d.name} (${d.count})`).join(" · ")}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 text-[11px] text-slate-400">
          <span>{m.kpiForeignNote}</span>
          {kpis.freshness.feedMinutes != null && (
            <span>
              {m.updatedAt}: {kpis.freshness.feedMinutes} {m.minAgo}
            </span>
          )}
          {kpis.freshness.riverMinutes != null && (
            <span>
              {m.riverTitle}: {kpis.freshness.riverMinutes} {m.minAgo}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
