import { Suspense } from "react";
import { getFeed } from "@/lib/feed";
import { getDirectory } from "@/lib/directory";
import { getMessages, isLang, type Lang, type Messages } from "@/lib/i18n";
import { BUILDERS } from "@/lib/config";
import RollingCount from "@/components/RollingCount";
import Hero from "@/components/Hero";
import KpiHeader from "@/components/KpiHeader";
import LiveUpdatesPanel from "@/components/LiveUpdatesPanel";
import SearchRescue from "@/components/SearchRescue";
import HelpSection from "@/components/HelpSection";
import HospitalSection from "@/components/HospitalSection";
import KailashAlert from "@/components/KailashAlert";
import DonationSection from "@/components/DonationSection";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
// The rescued list pages through the NDRRMA API sequentially; give the render
// enough head-room on Vercel (the default 10s can cut the fetch short).
export const maxDuration = 60;

export default async function Page({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang: Lang = isLang(searchParams.lang) ? searchParams.lang : "en";
  const m = getMessages(lang);
  // The hero shell only needs the (fast) feed for its timestamp + report links,
  // so it renders immediately; the counts + sections stream in behind it.
  const feed = await getFeed();

  return (
    <div id="top">
      {/* Invite bar: an obvious channel for new official data sources /
          corrections / feedback — the site depends on people reaching out. */}
      <div className="bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-xs sm:justify-start">
          <span>💡 {m.topInviteLabel}</span>
          {BUILDERS.map((b, i) => (
            <span key={b.handle}>
              {i > 0 && <span className="mx-1 text-slate-600">·</span>}
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white hover:text-amber-300"
              >
                {b.handle}
              </a>
            </span>
          ))}
        </div>
      </div>

      <Hero
        lang={lang}
        m={m}
        meta={{
          updatedAt: feed.updatedAt,
          sheetUrl: feed.sheetUrl,
          stale: feed.stale,
        }}
        forms={feed.forms}
        counts={
          <Suspense fallback={<HeroCountsSkeleton />}>
            <HeroCounts m={m} />
          </Suspense>
        }
      />

      <KailashAlert lang={lang} m={m} />

      <Suspense fallback={<OverviewSkeleton m={m} />}>
        <Overview lang={lang} m={m} />
      </Suspense>

      <Suspense fallback={null}>
        <LiveUpdates lang={lang} m={m} />
      </Suspense>

      <main>
        <section id="search-rescue" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10">
          <h2 className="text-2xl font-bold text-slate-900">{m.srTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.srIntro}</p>
          <div className="mt-5">
            <Suspense fallback={<ResultsSkeleton m={m} />}>
              <Results lang={lang} m={m} />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={null}>
          <Hospitals lang={lang} m={m} />
        </Suspense>

        <HelpSection lang={lang} m={m} forms={feed.forms} />
        <DonationSection lang={lang} m={m} />
      </main>

      <Footer lang={lang} m={m} fetchedAt={feed.fetchedAt} />
    </div>
  );
}

/* ---------- Streamed sections (each shares the cached getDirectory) ---------- */

async function HeroCounts({ m }: { m: Messages }) {
  const { merged } = await getDirectory();
  const total = merged.counts.missing + merged.counts.found;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
      <span>
        <RollingCount value={merged.counts.missing} className="font-bold text-white" />{" "}
        {m.statMissing}
      </span>
      <span>
        <RollingCount value={merged.counts.found} className="font-bold text-white" />{" "}
        {m.statFound}
      </span>
      <span>
        <RollingCount value={total} className="font-bold text-white" /> {m.statTracked}
      </span>
    </div>
  );
}

function HeroCountsSkeleton() {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <span className="inline-block h-4 w-48 animate-pulse rounded bg-white/15" />
    </div>
  );
}

async function Overview({ lang, m }: { lang: Lang; m: Messages }) {
  const { kpis, official } = await getDirectory();
  return <KpiHeader lang={lang} m={m} kpis={kpis} official={official} />;
}

function OverviewSkeleton({ m }: { m: Messages }) {
  return (
    <section className="border-b border-slate-200 bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
          {m.kpiTitle}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

async function LiveUpdates({ lang, m }: { lang: Lang; m: Messages }) {
  const { updates } = await getDirectory();
  return <LiveUpdatesPanel m={m} lang={lang} items={updates} />;
}

async function Results({ lang, m }: { lang: Lang; m: Messages }) {
  const { merged, deceased } = await getDirectory();
  return (
    <SearchRescue
      m={m}
      lang={lang}
      missing={merged.missing}
      found={merged.found}
      deceased={deceased}
      forms={merged.forms}
    />
  );
}

function ResultsSkeleton({ m }: { m: Messages }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
        {m.resultsLoading}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  );
}

async function Hospitals({ lang, m }: { lang: Lang; m: Messages }) {
  const { hospitalStats } = await getDirectory();
  return <HospitalSection lang={lang} m={m} stats={hospitalStats} />;
}
