import type { Lang, Messages } from "@/lib/i18n";
import type { HospitalStat } from "@/lib/bulletin";

export default function HospitalSection({
  m,
  stats,
}: {
  m: Messages;
  lang: Lang;
  stats: HospitalStat[];
}) {
  if (!stats.length) return null;
  const rows = stats.filter((s) => !s.isTotal);
  const total = stats.find((s) => s.isTotal);
  if (!rows.length) return null;

  return (
    <section id="hospitals" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-slate-900">{m.hospitalsTitle}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.hospitalsIntro}</p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">{m.hospitalName}</th>
                <th className="px-4 py-2.5 text-right">{m.hospitalTotal}</th>
                <th className="px-4 py-2.5 text-right">{m.hospitalDischarged}</th>
                <th className="px-4 py-2.5 text-right">{m.hospitalReferred}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 text-slate-800">{s.name}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                    {s.total}
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-700">
                    {s.discharged || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-amber-700">
                    {s.referred || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {total && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                  <td className="px-4 py-2.5">{m.hospitalTotalRow}</td>
                  <td className="px-4 py-2.5 text-right">{total.total}</td>
                  <td className="px-4 py-2.5 text-right">{total.discharged || "—"}</td>
                  <td className="px-4 py-2.5 text-right">{total.referred || "—"}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">{m.hospitalsNote}</p>
      </div>
    </section>
  );
}
