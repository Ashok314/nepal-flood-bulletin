/**
 * Static, code-managed content for the bulletin.
 *
 * Per the agreed scope, the admin panel manages *curated posts* and
 * *feed config/moderation* only. The content below (hotlines, donation
 * info, resources) lives here so your dev team controls it in review.
 *
 * IMPORTANT - DATA INTEGRITY:
 *   Anything marked `VERIFY:` must be confirmed against an official source
 *   before this page goes live. Do NOT publish unverified donation account
 *   numbers or emergency contacts - wrong details actively harm people in a
 *   disaster. The UI shows a warning banner while `donation.verified` is false.
 */

export const SITE = {
  name: "Nepal Flood - Rescue & Relief Bulletin",
  // The event this page covers. Update if repurposed for another event.
  event: "Rasuwa / Bhotekoshi Flood",
  // Source repo (the people data is a hand-maintained file committed here).
  repo: "nirajbhusal/rasuwa-flood-bulletin",
  // Primary upstream data source (GitHub Pages).
  defaultFeedUrl:
    "https://nirajbhusal.github.io/rasuwa-flood-bulletin/family.json",
  // Failover: the exact committed file (updates the instant a commit lands).
  rawFeedUrl:
    "https://raw.githubusercontent.com/nirajbhusal/rasuwa-flood-bulletin/main/family.json",
  // Live DHM river-gauge feed powering River Watch (early warning).
  defaultRiverUrl:
    "https://nirajbhusal.github.io/rasuwa-flood-bulletin/dhm-rivers.json",
  // Optional secondary source (kept for reference; Twitter/X is curated manually).
  backupFeedUrl: "",
  attribution: {
    // Full credit to the original creator of the data & bulletin.
    author: "Niraj Bhusal",
    authorUrl: "https://github.com/nirajbhusal",
    label: "Rasuwa Flood Bulletin",
    // The public source this data mirrors.
    url: "https://nirajbhusal.github.io/rasuwa-flood-bulletin/",
  },
} as const;

export type Hotline = {
  label_en: string;
  label_ne: string;
  number: string;
};

// Standard Nepal emergency numbers. VERIFY current values before publishing.
export const HOTLINES: Hotline[] = [
  { label_en: "Police", label_ne: "प्रहरी", number: "100" },
  { label_en: "Ambulance", label_ne: "एम्बुलेन्स", number: "102" },
  { label_en: "Fire", label_ne: "दमकल", number: "101" },
  { label_en: "Traffic Police", label_ne: "ट्राफिक प्रहरी", number: "103" },
  {
    label_en: "National Emergency (NEOC)",
    label_ne: "राष्ट्रिय आपत्‌कालीन कक्ष",
    number: "1149",
  },
];

export type ResourceLink = {
  label_en: string;
  label_ne: string;
  url: string;
};

// Helpful info / resource links, including official rescued lists to
// cross-check against (someone listed as missing may already be on an official
// rescued list). We link authoritative sources; we do not restate their data.
export const RESOURCES: ResourceLink[] = [
  {
    label_en: "Official rescued list, DAO Nuwakot (NDRRMA)",
    label_ne: "आधिकारिक उद्धार सूची, जिल्ला प्रशासन कार्यालय नुवाकोट (एनडीआरआरएमए)",
    url: "https://ndrrma.gov.np/np/misc-report/380",
  },
  {
    label_en: "NDRRMA (Disaster Authority)",
    label_ne: "एनडीआरआरएमए",
    url: "https://ndrrma.gov.np/",
  },
  {
    label_en: "Nepal Red Cross Society",
    label_ne: "नेपाल रेडक्रस सोसाइटी",
    url: "https://nrcs.org/",
  },
];

/**
 * PM Relief Fund - INFORMATIONAL ONLY (no payment processing).
 * These fields are intentionally blank. Fill them with officially verified
 * details, then set `verified: true`. While `verified` is false the public
 * page shows a "details pending verification" warning instead of the numbers.
 */
export const DONATION = {
  verified: false,
  fundName_en: "Prime Minister Disaster Relief Fund",
  fundName_ne: "प्रधानमन्त्री दैवी प्रकोप उद्धार कोष",
  // Official government donation portal (NCHL). The "Donate" button opens this.
  portalUrl: "https://pmdrf.nchl.com.np/",
  officialUrl: "https://pmdrf.nchl.com.np/",
  bankName: "", // VERIFY: official bank name
  accountName: "", // VERIFY: official account name
  accountNumber: "", // VERIFY: official account number
  note_en:
    "Donate only through official government channels. This page does not collect payments and is not affiliated with any government body.",
  note_ne:
    "कृपया सरकारी आधिकारिक माध्यमबाट मात्र सहयोग गर्नुहोस्। यो पृष्ठले भुक्तानी संकलन गर्दैन र कुनै सरकारी निकायसँग सम्बद्ध छैन।",
} as const;
