import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const publicPaths = ['/login']

/**
 * Middleware to protect dashboard routes
 * Redirects to login if user is not authenticated
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Check if the path is public or we're trying to access assets
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  const isAssetPath = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicon.ico')

  if (isPublicPath || isAssetPath) {
    return NextResponse.next()
  }

  // Check if the user is authenticated by looking for the token in the cookies
  const token = request.cookies.get('us50_admin_token')?.value

  // If not authenticated and trying to access protected route, redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    // Add the original URL as a parameter to redirect after login
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If we have a token, proceed to the requested page
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
