import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { getFeedConfig } from "@/lib/feed";

export const dynamic = "force-dynamic";

const UpdateBody = z.object({
  feedUrl: z.string().url().optional(),
  backupFeedUrl: z.string().url().or(z.literal("")).optional(),
  refreshInterval: z.number().int().min(30).max(86_400).optional(),
});

// Never leak the cached payload blob in the config response.
function present(cfg: Awaited<ReturnType<typeof getFeedConfig>>) {
  const { lastGoodPayload, ...rest } = cfg;
  return { ...rest, hasSnapshot: lastGoodPayload !== "" };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cfg = await getFeedConfig();
  return NextResponse.json(present(cfg));
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const parsed = UpdateBody.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await getFeedConfig(); // ensure the row exists
  const cfg = await prisma.feedConfig.update({
    where: { id: 1 },
    data: parsed.data,
  });
  return NextResponse.json(present(cfg));
}
