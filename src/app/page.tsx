import { getPrisma } from "@/lib/db";
import { getFeed } from "@/lib/feed";
import { getRivers } from "@/lib/rivers";
import { deriveKpis } from "@/lib/metrics";
import { getMessages, isLang, type Lang } from "@/lib/i18n";
import CreditBar from "@/components/CreditBar";
import Hero from "@/components/Hero";
import KpiHeader from "@/components/KpiHeader";
import RiverWatch from "@/components/RiverWatch";
import FloodMap from "@/components/FloodMap";
import SearchRescue from "@/components/SearchRescue";
import OfficialUpdates, {
  type PublicPost,
} from "@/components/OfficialUpdates";
import HelpSection from "@/components/HelpSection";
import DonationSection from "@/components/DonationSection";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: { lang?: string };
}) {
  const lang: Lang = isLang(searchParams.lang) ? searchParams.lang : "en";
  const m = getMessages(lang);

  const prisma = getPrisma();
  const [feed, rivers, rawPosts] = await Promise.all([
    getFeed(),
    getRivers(),
    prisma
      ? prisma.curatedPost
          .findMany({
            where: { published: true },
            orderBy: [
              { pinned: "desc" },
              { order: "asc" },
              { createdAt: "desc" },
            ],
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  const kpis = deriveKpis(feed, rivers);

  const posts: PublicPost[] = rawPosts.map((p) => ({
    id: p.id,
    type: p.type,
    url: p.url,
    title: p.title,
    source: p.source,
    verified: p.verified,
    pinned: p.pinned,
  }));

  return (
    <div id="top">
      <CreditBar m={m} />
      <Hero
        lang={lang}
        m={m}
        meta={{
          updatedAt: feed.updatedAt,
          sheetUrl: feed.sheetUrl,
          stale: feed.stale,
        }}
        counts={feed.counts}
      />

      <KpiHeader lang={lang} m={m} kpis={kpis} />

      <main>
        <RiverWatch lang={lang} m={m} rivers={rivers} />

        <section id="map" className="mx-auto max-w-6xl px-4 pb-10">
          <h2 className="text-2xl font-bold text-slate-900">{m.mapTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.mapIntro}</p>

          <div className="mt-4">
            <FloodMap stations={rivers.stations} m={m} lang={lang} />
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-6 rounded bg-brand" />
              {m.mapConfirmed}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 border-t-2 border-dashed border-amber-500" />
              {m.mapAtRisk}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex gap-0.5">
                <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-white" />
                <span className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-white" />
                <span className="h-3 w-3 rounded-full bg-emerald-600 ring-2 ring-white" />
              </span>
              {m.mapGauge}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-700 ring-2 ring-white" />
              {m.mapEntry}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{m.mapDisclaimer}</p>
          <p className="mt-1 text-[11px] text-slate-400">🌧 {m.mapRainNote}</p>

          {/* Safety call to action */}
          <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm">
            <span className="font-bold text-rose-700">{m.riverSafetyTitle}</span>{" "}
            <span className="text-slate-700">{m.riverSafetyBody}</span>
          </div>
        </section>

        <section
          id="search-rescue"
          className="mx-auto max-w-6xl px-4 py-10"
        >
          <h2 className="text-2xl font-bold text-slate-900">{m.srTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.srIntro}</p>
          <div className="mt-5">
            <SearchRescue
              m={m}
              missing={feed.missing}
              found={feed.found}
              forms={feed.forms}
            />
          </div>
        </section>

        <div className="bg-slate-100">
          <OfficialUpdates m={m} posts={posts} />
        </div>

        <HelpSection lang={lang} m={m} forms={feed.forms} />

        <DonationSection lang={lang} m={m} />
      </main>

      <Footer lang={lang} m={m} fetchedAt={feed.fetchedAt} />
    </div>
  );
}
