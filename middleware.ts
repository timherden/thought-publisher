import { NextResponse, type NextRequest } from "next/server";

/* Studio and its save route sit behind basic auth. Set STUDIO_PASSWORD (and optionally
   STUDIO_USER, default "tim") in the environment. With no password set, access is refused
   in production and open in development. */

export const config = { matcher: ["/studio/:path*", "/api/studio/:path*"] };

export function middleware(req: NextRequest) {
  const password = process.env.STUDIO_PASSWORD;
  const user = process.env.STUDIO_USER ?? "tim";

  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Studio is not configured.", { status: 404 });
  }

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const [u, p] = atob(header.slice(6)).split(":");
    if (u === user && p === password) return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Studio"' }
  });
}
