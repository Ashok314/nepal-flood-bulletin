import type { Person } from "@/lib/feed";

/**
 * Pure, dependency-free derivations used by both server metrics and client
 * cards. NO server-only imports here (this module is bundled to the client via
 * PersonCard).
 */

const NE_DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

export function neToLatinDigits(s: string): string {
  return s.replace(/[०-९]/g, (d) => NE_DIGITS[d] ?? d);
}

/** Extract a numeric age from strings like "54", "~50", "५६–५८", "अन्दाजी ३०". */
export function parseAge(age?: string): number | null {
  if (!age) return null;
  const m = neToLatinDigits(age).match(/\d{1,3}/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) && n > 0 && n < 130 ? n : null;
}

export function isMinor(age?: string): boolean {
  const n = parseAge(age);
  return n !== null && n < 18;
}

export function isElderly(age?: string): boolean {
  const n = parseAge(age);
  return n !== null && n >= 60;
}

const FOREIGN_KEYWORDS = [
  "india",
  "indian",
  "usa",
  "u.s",
  "united states",
  "texas",
  "dallas",
  "tamil nadu",
  "coimbatore",
  "karur",
  "chennai",
  "kerala",
  "bangalore",
  "bengaluru",
  "china",
  "chinese",
  "bangladesh",
  "bhutan",
  "sri lanka",
  "malaysia",
];

/** Heuristic: is this person likely a foreign national? (approximate) */
export function isForeign(person: Pick<Person, "place" | "note" | "phone" | "name">): boolean {
  const phone = (person.phone || "").replace(/\s/g, "");
  if (phone.startsWith("+") && !phone.startsWith("+977")) return true;
  const hay = [person.place, person.note, person.name].filter(Boolean).join(" ").toLowerCase();
  return FOREIGN_KEYWORDS.some((k) => hay.includes(k));
}

// Country detection from free text (place / note / name / phone). Best-effort:
// used to give foreign entries a specific country when the data reveals one.
const COUNTRY_KEYWORDS: { country: string; tokens: string[] }[] = [
  { country: "India", tokens: ["india", "indian", "tamil nadu", "coimbatore", "karur", "chennai", "kerala", "bangalore", "bengaluru", "new delhi", "mumbai", "kolkata", "bihar", "+91"] },
  { country: "USA", tokens: ["usa", "u.s.", "united states", "america", "american", "texas", "dallas", "california", "new york"] },
  { country: "China", tokens: ["china", "chinese", "beijing", "shanghai", "+86"] },
  { country: "Bangladesh", tokens: ["bangladesh", "+880"] },
  { country: "Bhutan", tokens: ["bhutan"] },
  { country: "Sri Lanka", tokens: ["sri lanka", "srilanka"] },
  { country: "Malaysia", tokens: ["malaysia"] },
  { country: "United Kingdom", tokens: ["united kingdom", "england", "london", "britain", "+44"] },
  { country: "Australia", tokens: ["australia", "+61"] },
  { country: "UAE", tokens: ["u.a.e", "uae", "dubai", "emirates", "abu dhabi"] },
];

export function detectCountry(text?: string): string | null {
  if (!text) return null;
  const hay = ` ${text.toLowerCase()} `;
  for (const c of COUNTRY_KEYWORDS) {
    if (c.tokens.some((t) => hay.includes(t))) return c.country;
  }
  return null;
}

export type PersonTags = { minor: boolean; elderly: boolean; foreign: boolean };

export function personTags(person: Person): PersonTags {
  return {
    minor: isMinor(person.age),
    elderly: isElderly(person.age),
    foreign: isForeign(person),
  };
}

/**
 * District detection. Matches district names (EN + NP) and well-known
 * landmarks that map to a district. Returns a canonical English name or null.
 */
const DISTRICTS: { canonical: string; tokens: string[] }[] = [
  { canonical: "Rasuwa", tokens: ["rasuwa", "रसुवा", "timure", "टिमुरे", "syafrubesi", "syabrubesi", "स्याफ्रुबेसी", "rasuwagadhi", "रसुवागढी", "dhunche", "धुन्चे", "gosaikunda", "गोसाइकुण्ड", "thuman", "थुमन", "hakubesi", "ghale gaun", "chilime"] },
  { canonical: "Nuwakot", tokens: ["nuwakot", "नुवाकोट", "trishuli", "त्रिशुली", "bidur", "बिदुर", "kakani"] },
  { canonical: "Sindhupalchowk", tokens: ["sindhupalchowk", "sindhupalchok", "सिन्धुपाल्चोक", "barhabise", "बाह्रबिसे", "bhotekoshi", "भोटेकोशी", "melamchi"] },
  { canonical: "Kathmandu", tokens: ["kathmandu", "काठमाडौं", "काठमाडौँ", "boudha", "बौद्ध", "gokarna", "gongabu"] },
  { canonical: "Dhading", tokens: ["dhading", "धादिङ"] },
  { canonical: "Kavrepalanchok", tokens: ["kavre", "काभ्रे", "panchkhal", "पाँचखाल", "banepa"] },
  { canonical: "Chitwan", tokens: ["chitwan", "चितवन", "bharatpur", "भरतपुर"] },
  { canonical: "Tanahun", tokens: ["tanahun", "तनहुँ", "damauli"] },
  { canonical: "Gorkha", tokens: ["gorkha", "गोरखा"] },
  { canonical: "Lamjung", tokens: ["lamjung", "लमजुङ"] },
  { canonical: "Solukhumbu", tokens: ["solukhumbu", "सोलुखुम्बु", "tapting"] },
  { canonical: "Makwanpur", tokens: ["makwanpur", "मकवानपुर", "hetauda"] },
  { canonical: "Sindhuli", tokens: ["sindhuli", "सिन्धुली"] },
  { canonical: "Ramechhap", tokens: ["ramechhap", "रामेछाप"] },
];

export function detectDistrict(text?: string): string | null {
  if (!text) return null;
  const hay = text.toLowerCase();
  for (const d of DISTRICTS) {
    if (d.tokens.some((t) => hay.includes(t))) return d.canonical;
  }
  return null;
}

export function personDistrict(person: Person): string | null {
  return detectDistrict([person.place, person.note, person.name].filter(Boolean).join(" "));
}

/** Parse the report timestamp embedded in feed ids: "sheet-YYYYMMDD-HHMMSS-...". */
export function parseReportTime(id?: string): Date | null {
  if (!id) return null;
  const m = id.match(/(\d{8})-(\d{6})/);
  if (!m) return null;
  const [, ymd, hms] = m;
  const y = ymd.slice(0, 4);
  const mo = ymd.slice(4, 6);
  const d = ymd.slice(6, 8);
  const hh = hms.slice(0, 2);
  const mm = hms.slice(2, 4);
  const ss = hms.slice(4, 6);
  // Reports are recorded in Nepal time (+05:45).
  const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}+05:45`;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}
