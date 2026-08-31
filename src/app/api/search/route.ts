import { NextRequest, NextResponse } from "next/server";
import { getDirectory } from "@/lib/directory";
import { searchPeople, type SearchTab } from "@/lib/searchPeople";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TABS: SearchTab[] = ["all", "missing", "found", "deceased"];

function tabFrom(value: string | null): SearchTab {
  return TABS.includes(value as SearchTab) ? (value as SearchTab) : "all";
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") || "1");
  const { merged, deceased } = await getDirectory();

  return NextResponse.json(
    searchPeople({
      q: params.get("q") || "",
      tab: tabFrom(params.get("tab")),
      country: params.get("country") || "all",
      rescueStatus: params.get("rescueStatus") || "all",
      page: Number.isFinite(page) ? page : 1,
      missing: merged.missing,
      found: merged.found,
      deceased,
    }),
  );
}
