import fs from "node:fs/promises";
import path from "node:path";
import type { Person, PersonStatus } from "@/lib/feed";
import { detectCountry, isForeign } from "@/lib/derive";
import { romanKey } from "@/lib/translit";

const DATA_FILE = path.join(process.cwd(), "public/data/opmcm-person-reports.json");
const SOURCE_URL = "https://rescue.opmcm.gov.np";

type OpmcmReport = {
  _id?: string;
  type?: string;
  fullName?: string;
  approximateAge?: string | number | null;
  locationText?: string | null;
  eventAt?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

type OpmcmPayload = {
  fetchedAt?: string;
  items?: OpmcmReport[];
};

function statusFrom(type?: string): PersonStatus | null {
  if (type === "lost") return "missing";
  if (type === "found") return "found";
  return null;
}

function imageUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.startsWith("http") ? value : `${SOURCE_URL}${value}`;
}

function reportUrl(id?: string): string {
  return id ? `${SOURCE_URL}/person-reports/${id}` : SOURCE_URL;
}

function normalizeReport(raw: OpmcmReport, index: number): Person | null {
  const status = statusFrom(raw.type);
  if (!status) return null;

  const name = raw.fullName?.trim();
  if (!name || name === "-") return null;
  const nameTokens = romanKey(name).split(" ").filter(Boolean);
  if (nameTokens.length < 2) return null;

  const blob = [name, raw.locationText, raw.description].filter(Boolean).join(" ");

  return {
    id: `opmcm-${raw._id || index}`,
    name,
    place: raw.locationText || undefined,
    age: raw.approximateAge == null ? undefined : String(raw.approximateAge),
    when: raw.eventAt ? new Date(raw.eventAt).toISOString() : undefined,
    note: raw.description || undefined,
    photo: imageUrl(raw.imageUrl),
    source: { label: "OPMCM Lost & Found", url: reportUrl(raw._id) },
    country:
      detectCountry(blob) ??
      (isForeign({ name, place: raw.locationText || undefined, note: raw.description || undefined })
        ? "Foreign"
        : "Nepal"),
    status,
  };
}

function dedupeKey(person: Person): string {
  const name = romanKey(person.name)
    .split(" ")
    .filter(Boolean)
    .sort()
    .join(" ");
  return [person.status, name, person.age || ""].join("|");
}

function dedupeOpmcmPeople(people: Person[]): Person[] {
  const seen = new Set<string>();
  const out: Person[] = [];

  for (const person of people) {
    const key = dedupeKey(person);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(person);
  }

  return out;
}

export async function getOpmcmPeople(): Promise<{ missing: Person[]; found: Person[] }> {
  let payload: OpmcmPayload;
  try {
    payload = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch {
    return { missing: [], found: [] };
  }

  const people = dedupeOpmcmPeople((payload.items || [])
    .map((item, index) => normalizeReport(item, index))
    .filter((person): person is Person => Boolean(person)));

  return {
    missing: people.filter((person) => person.status === "missing"),
    found: people.filter((person) => person.status === "found"),
  };
}
