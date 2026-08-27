import type { Messages } from "@/lib/i18n";
import { SITE } from "@/lib/config";

/**
 * Prominent credit ribbon at the very top of the page. Full credit to the
 * original creator of the data and bulletin this project builds on.
 */
export default function CreditBar({ m }: { m: Messages }) {
  const a = SITE.attribution;
  return (
    <div className="bg-slate-900 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-xs sm:justify-start">
        <span className="text-amber-300">★</span>
        <span>
          {m.creditBy}{" "}
          <a
            href={a.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline decoration-slate-500 underline-offset-2 hover:decoration-white"
          >
            {a.author}
          </a>{" "}
          —{" "}
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white underline decoration-slate-500 underline-offset-2 hover:decoration-white"
          >
            {a.label}
          </a>
        </span>
        <span className="text-slate-400">· {m.creditThanks}</span>
        <a
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-amber-300 hover:text-amber-200 sm:ml-auto"
        >
          {m.creditView} ↗
        </a>
      </div>
    </div>
  );
}
