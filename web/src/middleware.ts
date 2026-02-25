import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/api/health", "/monitoring"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Allow NextAuth API routes
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Redirect authenticated users away from login
    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Require auth for everything else
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const response = NextResponse.next();

  // HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
