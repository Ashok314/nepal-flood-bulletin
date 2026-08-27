import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { fetchAndCache, getFeedConfig } from "@/lib/feed";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await fetchAndCache();
    const cfg = await getFeedConfig();
    return NextResponse.json({
      ok: true,
      lastFetchedAt: cfg.lastFetchedAt,
      lastStatus: cfg.lastStatus,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
