import { getFeed } from "@/lib/feed";
import { getRivers } from "@/lib/rivers";
import { getRecentUpdates } from "@/lib/updates";
import { getNdrrmaRescued } from "@/lib/ndrrma";
import { deriveKpis } from "@/lib/metrics";
import { getMessages, isLang, type Lang } from "@/lib/i18n";
import CreditBar from "@/components/CreditBar";
import Hero from "@/components/Hero";
import KpiHeader from "@/components/KpiHeader";
import LiveUpdatesPanel from "@/components/LiveUpdatesPanel";
import RiverWatch from "@/components/RiverWatch";
import SearchRescue from "@/components/SearchRescue";
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

  const [feed, rivers, updates, ndrrma] = await Promise.all([
    getFeed(),
    getRivers(),
    getRecentUpdates(),
    getNdrrmaRescued(),
  ]);

  // Merge official NDRRMA rescued people into the "Rescued & safe" list.
  // Each card keeps its own source (community bulletin vs NDRRMA).
  const found = [...feed.found, ...ndrrma];
  const merged = {
    ...feed,
    found,
    counts: { ...feed.counts, found: found.length },
  };

  const kpis = deriveKpis(merged, rivers);

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
        counts={merged.counts}
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
              missing={merged.missing}
              found={merged.found}
              forms={merged.forms}
            />
          </div>
        </section>

        <RiverWatch lang={lang} m={m} rivers={rivers} />

        <HelpSection lang={lang} m={m} forms={feed.forms} />

        <DonationSection lang={lang} m={m} />
      </main>

      <Footer lang={lang} m={m} fetchedAt={feed.fetchedAt} />
    </div>
  );
}
