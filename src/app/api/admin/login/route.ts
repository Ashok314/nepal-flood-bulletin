import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyCredentials,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const Body = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const parsed = Body.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { username, password } = parsed.data;
  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: "invalid credentials" },
      { status: 401 },
    );
  }

  const token = await createSessionToken(username);
  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
