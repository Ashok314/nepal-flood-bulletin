import type { Lang, Messages } from "@/lib/i18n";
import { HOTLINES, RESOURCES } from "@/lib/config";
import { telHref } from "@/lib/format";

export default function HelpSection({
  lang,
  m,
  forms,
}: {
  lang: Lang;
  m: Messages;
  forms: { missing: string | null; found: string | null };
}) {
  return (
    <section id="help" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">{m.helpTitle}</h2>
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            {m.emergencyRelief}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{m.helpIntro}</p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Report forms */}
          <div className="rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">
              {m.reportMissing} / {m.reportFound}
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {forms.missing && (
                <a
                  href={forms.missing}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-rose-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-rose-700"
                >
                  {m.reportMissing}
                </a>
              )}
              {forms.found && (
                <a
                  href={forms.found}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {m.reportFound}
                </a>
              )}
              {!forms.missing && !forms.found && (
                <p className="text-sm text-slate-400">—</p>
              )}
            </div>
          </div>

          {/* Hotlines */}
          <div className="rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">{m.emergency}</h3>
            <ul className="mt-3 space-y-1.5">
              {HOTLINES.map((h) => (
                <li key={h.number} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {lang === "ne" ? h.label_ne : h.label_en}
                  </span>
                  <a
                    href={telHref(h.number)}
                    className="font-bold text-brand hover:underline"
                  >
                    {h.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="rounded-lg border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">{m.resourcesTitle}</h3>
            <ul className="mt-3 space-y-1.5">
              {RESOURCES.map((r) => (
                <li key={r.url} className="text-sm">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                  >
                    {lang === "ne" ? r.label_ne : r.label_en} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
