import { getSessionUser } from "@/lib/db/session";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const user = await getSessionUser();

  // Protected routes - redirect to login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login page
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({
    request,
  });
}
