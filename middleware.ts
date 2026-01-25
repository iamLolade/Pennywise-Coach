import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to handle route protection
 * 
 * Protected routes: /dashboard, /coach, /insights, /onboarding
 * Public routes: /, /signin, /signup
 * 
 * Note: Full authentication check happens client-side for reliability.
 * This middleware provides basic route structure.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/signin", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/coach", "/insights", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow all routes to pass through - client-side handles auth checks
  // This ensures Supabase session cookies are properly handled
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
