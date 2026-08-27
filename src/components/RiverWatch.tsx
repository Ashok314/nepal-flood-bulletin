import type { Lang, Messages } from "@/lib/i18n";
import type { RiversData, Station, RiverRisk } from "@/lib/rivers";
import { formatDateTime } from "@/lib/format";

const RISK_STYLE: Record<RiverRisk, { bar: string; badge: string; label: (m: Messages) => string }> = {
  danger: { bar: "bg-red-500", badge: "bg-red-100 text-red-800", label: (m) => m.riverDanger },
  warning: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-800", label: (m) => m.riverWarn },
  normal: { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", label: (m) => m.riverNormal },
  unknown: { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-600", label: () => "—" },
};

function Trend({ trend, m }: { trend: Station["trend"]; m: Messages }) {
  if (trend === "rising")
    return <span className="font-semibold text-red-600">↑ {m.riverRising}</span>;
  if (trend === "falling")
    return <span className="font-semibold text-emerald-600">↓ {m.riverFalling}</span>;
  if (trend === "steady")
    return <span className="font-medium text-slate-500">→ {m.riverSteady}</span>;
  return null;
}

function StationCard({ s, m, lang }: { s: Station; m: Messages; lang: Lang }) {
  const style = RISK_STYLE[s.risk];
  const title = lang === "ne" ? s.nameNp : s.name;
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        s.risk === "danger"
          ? "border-red-300"
          : s.risk === "warning"
            ? "border-amber-300"
            : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{title}</h3>
          {s.districtNp && <p className="text-xs text-slate-400">{s.districtNp}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}
        >
          {style.label(m)}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <span className="text-2xl font-extrabold text-slate-900">
            {s.levelM != null ? s.levelM.toFixed(2) : "—"}
          </span>
          <span className="ml-1 text-sm text-slate-500">m</span>
        </div>
        <div className="text-xs">
          <Trend trend={s.trend} m={m} />
        </div>
      </div>

      {/* Level bar with warning marker */}
      <div className="relative mt-2 h-2.5 w-full rounded-full bg-slate-200">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${style.bar}`}
          style={{ width: `${s.fillPct}%` }}
        />
        {s.warnMarkPct != null && (
          <div
            className="absolute -top-0.5 h-[calc(100%+4px)] w-0.5 bg-amber-600/70"
            style={{ left: `${s.warnMarkPct}%` }}
            title={m.riverWarn}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>
          {m.riverWarn}: {s.warningM != null ? `${s.warningM} m` : "—"}
        </span>
        <span>
          {m.riverDanger}: {s.dangerM != null ? `${s.dangerM} m` : "—"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        <span>
          {m.riverObserved}:{" "}
          {lang === "ne" && s.observedNpt
            ? s.observedNpt
            : formatDateTime(s.observedAt, lang)}
        </span>
        {s.source && (
          <a
            href={s.source}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:underline"
          >
            {m.riverSourceDhm} ↗
          </a>
        )}
      </div>

      {(s.washed || s.silent) && (
        <p className="mt-1.5 text-[11px] font-medium text-amber-600">
          ⚠ {m.riverReliability}
        </p>
      )}
    </div>
  );
}

export default function RiverWatch({
  m,
  lang,
  rivers,
}: {
  m: Messages;
  lang: Lang;
  rivers: RiversData;
}) {
  return (
    <section id="rivers" className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-900">{m.riverTitle}</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.riverIntro}</p>

      {rivers.summary.anyDanger ? (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          ⚠ {m.riverDangerAlert}
        </div>
      ) : rivers.summary.anyWarning ? (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          ⚠ {m.riverWarningAlert}
        </div>
      ) : null}

      {rivers.stations.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
          {m.riverEmpty}
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rivers.stations.map((s) => (
            <StationCard key={s.id} s={s} m={m} lang={lang} />
          ))}
        </div>
      )}
    </section>
  );
}
