import type { SetAllCookies } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { verifySupabaseSession } from "@/lib/auth/identity";
import { getPrivateDestination } from "@/lib/auth/redirects";
import { getSupabaseConfigOrNull } from "@/lib/supabase/config";
import { createSupabaseRequestClient } from "@/lib/supabase/request-client";

export async function proxy(request: NextRequest) {
  const pendingCookies = new Map<string, Parameters<SetAllCookies>[0][number]>();
  const cacheHeaders = new Headers({
    "Cache-Control": "private, no-store",
    Expires: "0",
    Pragma: "no-cache",
  });
  const config = getSupabaseConfigOrNull();
  const db = config && createSupabaseRequestClient(config, {
    getAll: () => request.cookies.getAll(),
    setAll(cookies, headers) {
      for (const cookie of cookies) {
        if (cookie.options.maxAge === 0) request.cookies.delete(cookie.name);
        else request.cookies.set(cookie.name, cookie.value);
        pendingCookies.set(cookie.name, cookie);
      }
      for (const [name, value] of Object.entries(headers)) cacheHeaders.set(name, value);
    },
  });
  const session = db && await verifySupabaseSession(db);
  const isLogin = request.nextUrl.pathname === "/login";
  const isNavigation = request.method === "GET" || request.method === "HEAD";
  let response: NextResponse;

  if (isNavigation && isLogin && session) {
    const destination = getPrivateDestination(request.nextUrl.searchParams.get("next"));
    response = NextResponse.redirect(new URL(destination, request.url));
  } else if (isNavigation && !isLogin && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", getPrivateDestination(`${request.nextUrl.pathname}${request.nextUrl.search}`));
    response = NextResponse.redirect(login);
  } else {
    // Forward refreshed cookies to the render as well as the browser.
    response = pendingCookies.size > 0
      ? NextResponse.next({ request: { headers: request.headers } })
      : NextResponse.next();
  }

  for (const { name, value, options } of pendingCookies.values()) response.cookies.set(name, value, options);
  cacheHeaders.forEach((value, name) => response.headers.set(name, value));
  return response;
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/clientes/:path*", "/oportunidades/:path*", "/pipeline/:path*"],
};
