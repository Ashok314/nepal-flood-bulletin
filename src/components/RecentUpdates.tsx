import type { Lang, Messages } from "@/lib/i18n";
import type { UpdateItem } from "@/lib/updates";
import { SITE } from "@/lib/config";
import { timeAgo } from "@/lib/format";

export default function RecentUpdates({
  m,
  lang,
  items,
}: {
  m: Messages;
  lang: Lang;
  items: UpdateItem[];
}) {
  const allUrl = `https://github.com/${SITE.repo}/commits/main/family.json`;
  const shown = items.slice(0, 8);

  return (
    <section id="live" className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {m.liveUpdatesTitle}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            {m.liveUpdatesIntro}
          </p>
        </div>
        <a
          href={allUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand hover:underline"
        >
          {m.viewAllCommits} ↗
        </a>
      </div>

      {shown.length === 0 ? (
        <p className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
          {m.liveUpdatesEmpty}
        </p>
      ) : (
        <ol className="mt-5 space-y-0 border-l-2 border-slate-200 pl-4">
          {shown.map((it) => (
            <li key={it.sha} className="relative pb-4 last:pb-0">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-slate-50" />
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <span className="text-xs font-medium text-slate-400">
                  {timeAgo(it.date, lang)}
                </span>
                <p className="text-sm text-slate-800 group-hover:text-brand">
                  {it.message}
                </p>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
