import Link from "next/link";
import type { Lang, Messages } from "@/lib/i18n";
import { SITE } from "@/lib/config";
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

        <p className="mt-4">
          {m.creditBy}{" "}
          <a
            href={SITE.attribution.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-700 underline hover:text-brand"
          >
            {SITE.attribution.author}
          </a>{" "}
          · {m.dataMirroredFrom}{" "}
          <a
            href={SITE.attribution.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-700 underline hover:text-brand"
          >
            {SITE.attribution.label}
          </a>
          {fetchedAt && (
            <span className="text-slate-400">
              {" "}
              · {m.updatedAt}: {formatDateTime(fetchedAt, lang)}
            </span>
          )}
        </p>

        <div className="mt-4 flex items-center gap-4">
          <a href="#top" className="hover:text-brand">
            ↑ {m.backToTop}
          </a>
          <Link href="/admin" className="text-slate-400 hover:text-brand">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
