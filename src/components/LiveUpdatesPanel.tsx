"use client";

import { useState } from "react";
import type { Lang, Messages } from "@/lib/i18n";
import type { UpdateItem } from "@/lib/updates";
import { timeAgo } from "@/lib/format";

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}

export default function LiveUpdatesPanel({
  m,
  lang,
  items,
}: {
  m: Messages;
  lang: Lang;
  items: UpdateItem[];
}) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  const shown = items.slice(0, 10);

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      {open ? (
        <div className="w-[min(20rem,86vw)] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <LiveDot />
              {m.liveUpdatesTitle}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md px-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <ol className="max-h-[55vh] divide-y divide-slate-100 overflow-y-auto overscroll-contain">
            {shown.map((it) => (
              <li key={it.sha} className="px-3.5 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {timeAgo(it.date, lang)}
                </div>
                <p className="mt-0.5 text-sm leading-snug text-slate-700">
                  {it.message}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3.5 py-2 text-sm font-bold text-slate-700 shadow-xl backdrop-blur transition hover:bg-white"
        >
          <LiveDot />
          {m.liveUpdatesTitle}
        </button>
      )}
    </div>
  );
}
