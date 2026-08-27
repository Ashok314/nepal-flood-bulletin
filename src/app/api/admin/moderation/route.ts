import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateBody = z.object({
  entryId: z.string().min(1),
  action: z.enum(["hide", "flag"]).default("hide"),
  reason: z.string().max(300).optional().default(""),
});

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const flags = await prisma.moderationFlag.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(flags);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const parsed = CreateBody.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { entryId, action, reason } = parsed.data;
  const flag = await prisma.moderationFlag.upsert({
    where: { entryId },
    create: { entryId, action, reason },
    update: { action, reason },
  });
  return NextResponse.json(flag, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const entryId = new URL(req.url).searchParams.get("entryId");
  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 });
  }
  try {
    await prisma.moderationFlag.delete({ where: { entryId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
