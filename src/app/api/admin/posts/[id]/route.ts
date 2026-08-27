import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const UpdateBody = z.object({
  type: z.enum(["tweet", "link", "notice"]).optional(),
  url: z.string().url().optional(),
  title: z.string().min(1).max(300).optional(),
  source: z.string().max(120).optional(),
  verified: z.boolean().optional(),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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
  try {
    const post = await prisma.curatedPost.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await prisma.curatedPost.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
