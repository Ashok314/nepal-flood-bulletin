import { getPrisma } from "@/lib/db";
import { getFeed } from "@/lib/feed";
import { getRivers } from "@/lib/rivers";
import { getRecentUpdates } from "@/lib/updates";
import { deriveKpis } from "@/lib/metrics";
import { getMessages, isLang, type Lang } from "@/lib/i18n";
import CreditBar from "@/components/CreditBar";
import Hero from "@/components/Hero";
import KpiHeader from "@/components/KpiHeader";
import LiveUpdatesPanel from "@/components/LiveUpdatesPanel";
import RiverWatch from "@/components/RiverWatch";
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
  const [feed, rivers, updates, rawPosts] = await Promise.all([
    getFeed(),
    getRivers(),
    getRecentUpdates(),
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

      <LiveUpdatesPanel m={m} lang={lang} items={updates} />

      <main>
        <section
          id="search-rescue"
          className="mx-auto max-w-6xl px-4 py-10"
        >
          <h2 className="text-2xl font-bold text-slate-900">{m.srTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.srIntro}</p>
          <div className="mt-5">
            <SearchRescue
              m={m}
              lang={lang}
              missing={feed.missing}
              found={feed.found}
              forms={feed.forms}
            />
          </div>
        </section>

        <RiverWatch lang={lang} m={m} rivers={rivers} />

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
