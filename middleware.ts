import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
];

// Define paths that require specific roles
const roleProtectedPaths = {
  '/admin': ['admin'],
  '/broker': ['broker'],
  '/student': ['student'],
};

// Define public paths that don't need any redirection
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/unauthorized',
  '/',
  '/about',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path requires specific roles
  const requiredRoles = Object.entries(roleProtectedPaths).find(([path]) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )?.[1];
  
  // Skip middleware for non-protected paths
  if (!isProtectedPath && !requiredRoles && !publicPaths.some(path => pathname === path)) {
    return NextResponse.next();
  }

  // For API routes, we'll let the API handle authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const accessToken = request.cookies.get('auth_access_token')?.value;
  
  // If no token and trying to access protected path, redirect to login
  if (!accessToken && (isProtectedPath || requiredRoles)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // For role-based paths, we need to check the token on the client side
  // since we can't decode JWT securely in middleware
  // The client-side ProtectedRoute component will handle this check

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images folder
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};