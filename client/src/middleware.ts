import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  let cookie = !!request.cookies.get("dataToken");

  if (!cookie) {
    return NextResponse.redirect("https://mo4-web");
  }

  return NextResponse.next();
}
