import Link from "next/link";
import type { Lang, Messages } from "@/lib/i18n";

export default function LanguageToggle({
  lang,
  m,
}: {
  lang: Lang;
  m: Messages;
}) {
  const other: Lang = lang === "en" ? "ne" : "en";
  return (
    <Link
      href={`/?lang=${other}`}
      className="rounded-md border border-white/30 px-2.5 py-1 text-sm font-medium text-white/90 transition hover:bg-white/10"
      aria-label={`Switch to ${m.otherLangName}`}
    >
      {m.otherLangName}
    </Link>
  );
}
