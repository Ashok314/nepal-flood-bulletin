import type { Lang, Messages } from "@/lib/i18n";
import { DATA_SOURCES, BUILDERS } from "@/lib/config";
import { formatDateTime } from "@/lib/format";

export default function Footer({
  lang,
  m,
  fetchedAt,
}: {
  lang: Lang;
  m: Messages;
  fetchedAt: string | null;
}) {
  return (
    <footer className="border-t border-slate-200 bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
        <p className="max-w-3xl">{m.footerDisclaimer}</p>

        {DATA_SOURCES.length > 0 && (
          <p className="mt-4 text-slate-500">
            {m.dataSourcesLabel}:{" "}
            {DATA_SOURCES.map((s, i) => (
              <span key={s.url}>
                {i > 0 && " · "}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-700 underline hover:text-brand"
                >
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        )}

        {fetchedAt && (
          <p className="mt-2 text-slate-400">
            {m.updatedAt}: {formatDateTime(fetchedAt, lang)}
          </p>
        )}

        {BUILDERS.length > 0 && (
          <p className="mt-2 text-slate-500">
            {m.suggestionsLabel}{" "}
            {BUILDERS.map((b, i) => (
              <span key={b.handle}>
                {i > 0 && " · "}
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-700 underline hover:text-brand"
                >
                  {b.handle}
                </a>
              </span>
            ))}
          </p>
        )}

        <div className="mt-4">
          <a href="#top" className="hover:text-brand">
            ↑ {m.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
