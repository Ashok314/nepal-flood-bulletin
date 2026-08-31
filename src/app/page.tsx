import { getFeed } from "@/lib/feed";
import { getRivers } from "@/lib/rivers";
import { getRecentUpdates } from "@/lib/updates";
import { getNdrrmaRescued } from "@/lib/ndrrma";
import { getBulletinRescued, getHospitalStats } from "@/lib/bulletin";
import { getPoliceBodies } from "@/lib/police";
import { getDaoRescued } from "@/lib/dao";
import { getTweetRescued } from "@/lib/tweetRescued";
import { romanKey } from "@/lib/translit";
import type { Person } from "@/lib/feed";
import { deriveKpis } from "@/lib/metrics";
import { getMessages, isLang, type Lang } from "@/lib/i18n";
import { BUILDERS } from "@/lib/config";
import Hero from "@/components/Hero";
import KpiHeader from "@/components/KpiHeader";
import LiveUpdatesPanel from "@/components/LiveUpdatesPanel";
// import RiverWatch from "@/components/RiverWatch"; // paused: focusing on people
import SearchRescue from "@/components/SearchRescue";
import HelpSection from "@/components/HelpSection";
import HospitalSection from "@/components/HospitalSection";
import KailashAlert from "@/components/KailashAlert";
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

  const [feed, rivers, updates, ndrrma, bulletin, police] = await Promise.all([
    getFeed(),
    getRivers(), // still used for the situation KPI (rivers above warning)
    getRecentUpdates(),
    getNdrrmaRescued(),
    getBulletinRescued(), // official rescue lists parsed from the bulletin (when present)
    getPoliceBodies(), // Nepal Police unidentified recovered bodies
  ]);

  const hospitalStats = await getHospitalStats(); // reuses the cached bulletin HTML

  // Merge each source into one searchable list, every card keeping its own
  // source + deep-link. Deduped by romanized name + age so a person listed in
  // several places shows once (first occurrence wins — official sources first).
  const dedupePeople = (lists: Person[][]): Person[] => {
    const seen = new Set<string>();
    const out: Person[] = [];
    for (const list of lists) {
      for (const p of list) {
        const key = `${romanKey(p.name)}|${p.age || ""}`;
        if (p.name && p.name !== "-" && seen.has(key)) continue;
        seen.add(key);
        out.push(p);
      }
    }
    return out;
  };

  const found = dedupePeople([
    ndrrma,
    bulletin,
    getTweetRescued(), // NDRRMA official list (2083.05.13), sourced to their tweet
    feed.found,
    getDaoRescued(),
  ]);
  const missingRaw = dedupePeople([feed.missing]);

  // Flag anyone in the missing list who also appears in the rescued list with
  // the same name + age — they may already be safe. Soft hint ("may…, check"),
  // so a coincidental same-name match just prompts a double-check.
  const foundKeys = new Set(
    found.filter((p) => p.age).map((p) => `${romanKey(p.name)}|${p.age}`),
  );
  const missing = missingRaw.map((p) =>
    p.age && foundKeys.has(`${romanKey(p.name)}|${p.age}`)
      ? { ...p, possiblyRescued: true }
      : p,
  );

  const deceased = police; // unidentified recovered bodies — never name-deduped
  const merged = {
    ...feed,
    missing,
    found,
    counts: { missing: missing.length, found: found.length },
  };

  const kpis = deriveKpis(merged, rivers);

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
        counts={merged.counts}
        forms={merged.forms}
      />

      <KailashAlert lang={lang} m={m} />

      <KpiHeader lang={lang} m={m} kpis={kpis} />

      <LiveUpdatesPanel m={m} lang={lang} items={updates} />

      <main>
        <section
          id="search-rescue"
          className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10"
        >
          <h2 className="text-2xl font-bold text-slate-900">{m.srTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{m.srIntro}</p>
          <div className="mt-5">
            <SearchRescue
              m={m}
              lang={lang}
              missing={merged.missing}
              found={merged.found}
              deceased={deceased}
              forms={merged.forms}
            />
          </div>
        </section>

        {/* River Watch paused to keep focus on people search
        <RiverWatch lang={lang} m={m} rivers={rivers} /> */}

        <HospitalSection lang={lang} m={m} stats={hospitalStats} />

        <HelpSection lang={lang} m={m} forms={feed.forms} />

        <DonationSection lang={lang} m={m} />
      </main>

      <Footer lang={lang} m={m} fetchedAt={feed.fetchedAt} />
    </div>
  );
}
