import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Check for redirect destination in cookie, fallback to /fan-page
  const cookieStore = await cookies();
  const redirectCookie = cookieStore.get("auth_redirect");
  const next = redirectCookie?.value ?? "/fan-page";

  // Determine the correct login page based on the destination
  const loginPage = next.startsWith("/home") ? "/home/login" : "/fan-page/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Clear the redirect cookie
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete("auth_redirect");
      return response;
    }
  }

  // Return the user to the appropriate login page with error
  const response = NextResponse.redirect(`${origin}${loginPage}?error=auth_failed`);
  response.cookies.delete("auth_redirect");
  return response;
}
