"use client";

import { useSearchQuery } from "@/lib/searchStore";
import type { Messages } from "@/lib/i18n";

// The primary search field — lives in the hero and drives the results list
// below. Typing filters live; Search (or Enter) jumps to the results.
export default function HeroSearch({ m }: { m: Messages }) {
  const [q, setQ] = useSearchQuery();

  function jumpToResults() {
    document
      .getElementById("search-rescue")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        jumpToResults();
      }}
      className="rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 sm:p-2.5"
    >
      <div className="flex flex-row items-center gap-2">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M20 20l-3.2-3.2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={m.searchPlaceholder}
            aria-label={m.searchByName}
            className="w-full rounded-xl bg-transparent py-3 pl-11 pr-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark sm:px-6"
        >
          {m.searchCta}
        </button>
      </div>
      <p className="mt-1.5 hidden px-1.5 pb-0.5 text-xs text-slate-500 sm:block">
        {m.heroSearchHelp}
      </p>
    </form>
  );
}
