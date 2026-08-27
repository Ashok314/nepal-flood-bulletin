import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateBody = z.object({
  type: z.enum(["tweet", "link", "notice"]).default("link"),
  url: z.string().url(),
  title: z.string().min(1).max(300),
  source: z.string().max(120).optional().default(""),
  verified: z.boolean().optional().default(false),
  pinned: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const posts = await prisma.curatedPost.findMany({
    orderBy: [{ pinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(posts);
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
  const post = await prisma.curatedPost.create({ data: parsed.data });
  return NextResponse.json(post, { status: 201 });
}
