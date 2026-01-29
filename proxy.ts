import { auth } from "@/auth";

export const proxy = auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/app")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/app/:path*"],
};

