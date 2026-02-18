// INSTALL REQUIRED: npm install @supabase/ssr
// This package provides SSR-compatible Supabase clients for Next.js App Router.

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Creates a Supabase client suitable for use inside Next.js middleware.
 * Unlike the server client, this one operates on a mutable Response so
 * it can write updated session cookies back to the browser on every request.
 *
 * Returns both the Supabase client and the (potentially modified) response
 * object so the middleware can forward cookie mutations to the browser.
 */
export function createMiddlewareClient(request: NextRequest) {
  // Start with a pass-through response. We may attach Set-Cookie headers.
  let response = NextResponse.next({
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
          // Write cookies to both the request (so downstream server code sees
          // the updated session) and the response (so the browser receives them).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response };
}
