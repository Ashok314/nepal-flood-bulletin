import type { Lang, Messages } from "@/lib/i18n";
import { OFFICIAL_RESCUED_SOURCES } from "@/lib/config";

/**
 * A person listed as missing in the community feed may already appear on an
 * official rescued list. We link the authoritative sources so people can
 * cross-check (we never scrape or restate government data ourselves).
 */
export default function OfficialRescuedNote({
  lang,
  m,
}: {
  lang: Lang;
  m: Messages;
}) {
  if (OFFICIAL_RESCUED_SOURCES.length === 0) return null;
  return (
    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-bold text-emerald-900">
        ✅ {m.crossCheckTitle}
      </p>
      <p className="mt-1 text-sm text-emerald-800">{m.crossCheckNote}</p>
      <ul className="mt-2 space-y-1">
        {OFFICIAL_RESCUED_SOURCES.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
            >
              {lang === "ne" ? s.label_ne : s.label_en} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
