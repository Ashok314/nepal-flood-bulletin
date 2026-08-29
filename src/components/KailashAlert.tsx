"use client";

import { useState } from "react";
import type { Lang, Messages } from "@/lib/i18n";
import { telHref } from "@/lib/format";

// Indian Embassy Kathmandu emergency lines issued for flood-affected Indians.
const EMBASSY_PHONES = ["+977 9851316807", "+977 9709107500"];
const MOFA_URL = "https://www.mofa.gov.np/";
const NEWS = [
  {
    label: "India.com — 77 Isha members untraceable",
    url: "https://www.india.com/news/india/nepal-floods-over-130-indians-including-kailash-mansarovar-pilgrims-missing-77-isha-foundation-members-untraceable-8510909/",
  },
  {
    label: "India TV — 32-member Kolkata group",
    url: "https://www.indiatvnews.com/west-bengal/kolkata-nepal-flash-floods-32-member-kolkata-group-on-kailash-mansarovar-yatra-goes-missing-cm-suvendu-adhikari-expresses-concern-2026-08-27-1052605",
  },
  {
    label: "The News Minute — Isha S3 group",
    url: "https://www.thenewsminute.com/news/80-isha-pilgrims-missing-in-tibet-flash-flood-jaggi-vasudev-seeks-access-to-gyirong",
  },
];

// Floating, collapsible notice — a compact capsule pinned to the side that
// expands on tap to show the Kailash / Isha "S3" pilgrim situation + official
// contacts. Kept out of the main flow so the search stays front-and-centre.
export default function KailashAlert({ m }: { lang: Lang; m: Messages }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-3 top-16 z-30 print:hidden sm:right-4">
      {open ? (
        <div className="max-h-[82vh] w-[min(23rem,90vw)] overflow-y-auto rounded-2xl border-l-4 border-amber-500 bg-white p-4 shadow-2xl ring-1 ring-amber-100">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-800">
              ⚠ {m.kailashTag}
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

          <h2 className="text-base font-bold text-slate-900">{m.kailashTitle}</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            {m.kailashBody}
          </p>

          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {m.kailashContactsLabel}
            </p>
            <p className="mt-1 text-xs text-slate-600">{m.kailashEmbassy}:</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {EMBASSY_PHONES.map((p) => (
                <a
                  key={p}
                  href={telHref(p)}
                  className="rounded-md bg-brand/5 px-2 py-1 text-xs font-semibold text-brand ring-1 ring-brand/15 hover:bg-brand/10"
                >
                  {p}
                </a>
              ))}
            </div>
            <a
              href={MOFA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-xs font-medium text-brand underline hover:text-brand-dark"
            >
              {m.kailashMofaLabel} ↗
            </a>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            {m.kailashNewsLabel}:{" "}
            {NEWS.map((n, i) => (
              <span key={n.url}>
                {i > 0 && " · "}
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-brand"
                >
                  {n.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-800 shadow-lg ring-1 ring-amber-100 transition hover:bg-amber-50"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          ⚠ {m.kailashChip}
        </button>
      )}
    </div>
  );
}
