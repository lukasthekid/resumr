import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  // Better Auth does not use the Auth.js middleware wrapper. Keep this lightweight
  // check for paths protected by proxy and rely on page/API guards for definitive auth.
  if (req.nextUrl.pathname.startsWith("/app")) {
    const hasSessionCookie =
      !!req.cookies.get("better-auth.session_token") ||
      !!req.cookies.get("__Secure-better-auth.session_token");

    if (!hasSessionCookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return Response.redirect(url);
    }
  }
}

export const config = {
  matcher: ["/app/:path*"],
};

