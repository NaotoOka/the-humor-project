import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /fan-page route (but not /fan-page/login)
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/fan-page") &&
    !request.nextUrl.pathname.startsWith("/fan-page/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/fan-page/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from fan-page login page
  if (user && request.nextUrl.pathname === "/fan-page/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/fan-page";
    return NextResponse.redirect(url);
  }

  // Protect /home/memefier and /home/mememeter routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/home/memefier") ||
      request.nextUrl.pathname.startsWith("/home/mememeter"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/home/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from home login page
  if (user && request.nextUrl.pathname === "/home/login") {
    const next = request.nextUrl.searchParams.get("next") || "/home";
    const url = request.nextUrl.clone();
    url.pathname = next;
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
