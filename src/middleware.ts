import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/", "/invoices"]
// Routes that should redirect to home if already authenticated
const authRoutes = ["/auth/login", "/auth/signup"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Firebase auth session cookie
  const authToken = request.cookies.get("__session")?.value

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
