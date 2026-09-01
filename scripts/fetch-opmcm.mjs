import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://rescue.opmcm.gov.np/api/person-reports";
const OUT = path.join(process.cwd(), "public/data/opmcm-person-reports.json");
const LIMIT = 500;

async function fetchPage(page) {
  const url = `${API}?page=${page}&limit=${LIMIT}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} failed: HTTP ${res.status}`);
  return res.json();
}

const first = await fetchPage(1);
const firstData = first.data || {};
const total = Number(firstData.total || firstData.totalItems || firstData.count || 0);
const pages = Number(firstData.totalPages || Math.ceil(total / LIMIT) || 1);
const items = [...(firstData.items || [])];

for (let page = 2; page <= pages; page += 1) {
  const json = await fetchPage(page);
  items.push(...(json.data?.items || []));
}

const slimItems = items.map((item) => ({
  _id: item._id,
  type: item.type,
  fullName: item.fullName,
  approximateAge: item.approximateAge,
  locationText: item.locationText,
  eventAt: item.eventAt,
  description: item.description,
  imageUrl: item.imageUrl,
}));

const comparable = JSON.stringify({ sourceUrl: API, total, items: slimItems });
try {
  const existing = JSON.parse(await readFile(OUT, "utf8"));
  const existingComparable = JSON.stringify({
    sourceUrl: existing.sourceUrl,
    total: existing.total,
    items: existing.items,
  });
  if (existingComparable === comparable) {
    console.log(`OPMCM data unchanged (${slimItems.length} reports).`);
    process.exit(0);
  }
} catch {
  // First run, or an unreadable previous file: write a fresh snapshot.
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: API,
      total,
      items: slimItems,
    },
    null,
    2,
  ),
);

console.log(`Wrote ${slimItems.length} OPMCM reports to ${OUT}`);
