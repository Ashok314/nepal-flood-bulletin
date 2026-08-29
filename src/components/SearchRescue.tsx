"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Person } from "@/lib/feed";
import type { Lang, Messages } from "@/lib/i18n";
import { romanKey } from "@/lib/translit";
import { useSearchQuery } from "@/lib/searchStore";
import PersonCard from "./PersonCard";

type Tab = "all" | "missing" | "found" | "deceased";

const PAGE_SIZE = 24;

export default function SearchRescue({
  m,
  lang,
  missing,
  found,
  deceased = [],
  forms,
}: {
  m: Messages;
  lang: Lang;
  missing: Person[];
  found: Person[];
  deceased?: Person[];
  forms: { missing: string | null; found: string | null };
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useSearchQuery(); // shared with the hero search box
  const [country, setCountry] = useState("all");
  const [rescueStatus, setRescueStatus] = useState("all");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const list =
    tab === "missing"
      ? missing
      : tab === "found"
        ? found
        : tab === "deceased"
          ? deceased
          : [...missing, ...found, ...deceased];

  // Precompute a plain blob + a romanized phonetic key per person, so Devanagari
  // names are searchable by romanized text (e.g. "binod" finds बिनोद).
  const indexed = useMemo(
    () =>
      list.map((p) => {
        const blob = [p.name, p.nameEn, p.place, p.phone, p.note, p.when]
          .filter(Boolean)
          .join(" ");
        return { p, plain: blob.toLowerCase(), key: romanKey(blob) };
      }),
    [list],
  );

  // Countries present in this list, with counts. Nepal first, Foreign last.
  const countryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of list) {
      if (p.country) counts.set(p.country, (counts.get(p.country) || 0) + 1);
    }
    const rank = (c: string) => (c === "Nepal" ? 0 : c === "Foreign" ? 2 : 1);
    return [...counts.entries()].sort((a, b) =>
      rank(a[0]) !== rank(b[0])
        ? rank(a[0]) - rank(b[0])
        : a[0].localeCompare(b[0]),
    );
  }, [list]);

  // Rescue statuses present (Safe / Injured / Under Medical Care / …), with counts.
  const statusOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of list) {
      if (p.rescueStatus)
        counts.set(p.rescueStatus, (counts.get(p.rescueStatus) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [list]);

  // Rank results: exact text matches first, then fuzzy / transliteration
  // (romanized) matches. Both are shown so a spelling/script difference never
  // hides someone — but the fuzzy ones are surfaced with a caution.
  const { results, fuzzyCount } = useMemo(() => {
    const raw = q.trim();
    const base = indexed
      .filter((a) => country === "all" || a.p.country === country)
      .filter(
        (a) => rescueStatus === "all" || a.p.rescueStatus === rescueStatus,
      );
    if (!raw) return { results: base.map((a) => a.p), fuzzyCount: 0 };
    const plainQ = raw.toLowerCase();
    const qWords = romanKey(raw).split(" ").filter(Boolean);
    const exact: Person[] = [];
    const fuzzy: Person[] = [];
    for (const a of base) {
      if (a.plain.includes(plainQ)) exact.push(a.p);
      else if (qWords.length > 0 && qWords.every((w) => a.key.includes(w)))
        fuzzy.push(a.p);
    }
    return { results: [...exact, ...fuzzy], fuzzyCount: fuzzy.length };
  }, [q, country, rescueStatus, indexed]);

  // Reset page on any filter change; reset filters when switching tabs.
  useEffect(() => {
    setPage(1);
  }, [q, tab, country, rescueStatus]);
  useEffect(() => {
    setCountry("all");
    setRescueStatus("all");
  }, [tab]);

  function statusLabel(s: string) {
    const ne: Record<string, string> = {
      Safe: "सुरक्षित",
      Injured: "घाइते",
      "Under Medical Care": "उपचाररत",
      "Transferred to Relief Camp": "राहत शिविरमा",
      Rescued: "उद्धार गरिएको",
    };
    return lang === "ne" && ne[s] ? ne[s] : s;
  }

  function countryLabel(c: string) {
    return c === "Nepal" ? m.countryNepal : c === "Foreign" ? m.countryForeign : c;
  }

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  function goTo(p: number) {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef}>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            {m.filterAll}
            <Count
              active={tab === "all"}
              n={missing.length + found.length}
              tone="slate"
            />
          </TabButton>
          <TabButton active={tab === "missing"} onClick={() => setTab("missing")}>
            {m.tabMissing}
            <Count active={tab === "missing"} n={missing.length} tone="rose" />
          </TabButton>
          <TabButton active={tab === "found"} onClick={() => setTab("found")}>
            {m.tabFound}
            <Count active={tab === "found"} n={found.length} tone="emerald" />
          </TabButton>
          {deceased.length > 0 && (
            <TabButton
              active={tab === "deceased"}
              onClick={() => setTab("deceased")}
            >
              {m.tabDeceased}
              <Count active={tab === "deceased"} n={deceased.length} tone="slate" />
            </TabButton>
          )}
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          {forms.missing && (
            <a
              href={forms.missing}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
            >
              + {m.reportMissing}
            </a>
          )}
          {forms.found && (
            <a
              href={forms.found}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              + {m.reportFound}
            </a>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={m.searchPlaceholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters: country + rescue status */}
      {(countryOptions.length > 1 || statusOptions.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {countryOptions.length > 1 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="country-filter"
                className="text-sm font-medium text-slate-500"
              >
                {m.countryLabel}:
              </label>
              <select
                id="country-filter"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="all">
                  {m.filterAll} ({list.length})
                </option>
                {countryOptions.map(([c, n]) => (
                  <option key={c} value={c}>
                    {countryLabel(c)} ({n})
                  </option>
                ))}
              </select>
            </div>
          )}
          {statusOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium text-slate-500"
              >
                {m.rescueStatusLabel}:
              </label>
              <select
                id="status-filter"
                value={rescueStatus}
                onChange={(e) => setRescueStatus(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="all">{m.filterAll}</option>
                {statusOptions.map(([s, n]) => (
                  <option key={s} value={s}>
                    {statusLabel(s)} ({n})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {tab === "deceased" && (
        <p className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {m.deceasedNote}
        </p>
      )}

      {q.trim() !== "" && fuzzyCount > 0 && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {m.fuzzyNote}
        </p>
      )}

      {/* Result summary */}
      <p className="mb-3 text-sm text-slate-500">
        {total === 0
          ? m.noResults
          : `${m.showing} ${start + 1}–${start + pageItems.length} ${m.of} ${total} ${m.resultsCount}`}
      </p>

      {total === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {m.noResults}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <PersonCard key={p.id} person={p} m={m} lang={lang} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination current={current} totalPages={totalPages} onGo={goTo} m={m} />
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Pagination ---------------- */

function pageWindow(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const pages: number[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    }
  }
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (prev) {
      if (p - prev === 2) out.push(prev + 1);
      else if (p - prev > 2) out.push("…");
    }
    out.push(p);
    prev = p;
  }
  return out;
}

function Pagination({
  current,
  totalPages,
  onGo,
  m,
}: {
  current: number;
  totalPages: number;
  onGo: (p: number) => void;
  m: Messages;
}) {
  const items = pageWindow(current, totalPages);
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <PageBtn disabled={current === 1} onClick={() => onGo(current - 1)}>
        ‹ {m.prev}
      </PageBtn>
      {items.map((it, i) =>
        it === "…" ? (
          <span key={`d${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <PageBtn key={it} active={it === current} onClick={() => onGo(it)}>
            {it}
          </PageBtn>
        ),
      )}
      <PageBtn disabled={current === totalPages} onClick={() => onGo(current + 1)}>
        {m.next} ›
      </PageBtn>
    </nav>
  );
}

function PageBtn({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[2.25rem] rounded-md border px-2.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

/* ---------------- Tabs ---------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center rounded-md px-3 py-1.5 text-sm font-semibold transition ${
        active ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Count({
  n,
  active,
  tone,
}: {
  n: number;
  active: boolean;
  tone: "rose" | "emerald" | "slate";
}) {
  const toneCls = active
    ? "bg-white/25 text-white"
    : tone === "rose"
      ? "bg-rose-100 text-rose-700"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-100 text-slate-700";
  return (
    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${toneCls}`}>
      {n}
    </span>
  );
}
