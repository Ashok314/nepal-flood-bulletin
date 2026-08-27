import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep this in sync with SESSION_COOKIE in src/lib/auth.ts. We inline the
// literal here so middleware (edge runtime) never imports next/headers.
const SESSION_COOKIE = "admin_session";

// Lightweight UX gate: if there's no session cookie, bounce /admin pages to the
// login screen. Real authorization (signature verification) is enforced in the
// admin page and every /api/admin route, which run in the Node runtime.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtectedPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedPage && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
