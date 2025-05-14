import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define protected paths
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

// Type for decoded JWT token
interface DecodedToken {
  user_id: string;
  username: string;
  email?: string;
  roles?: 'student' | 'broker' | 'admin';
  exp: number;
  [key: string]: any;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
 
  // Skip middleware for non-protected paths
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // For API routes, we'll let the API handle authentication
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path requires specific roles
  const requiredRoleEntry = Object.entries(roleProtectedPaths).find(([path]) => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  const requiredRoles = requiredRoleEntry ? requiredRoleEntry[1] : null;
  
  // If not protected or role-protected and not a public path, just proceed
  if (!isProtectedPath && !requiredRoles && !isPublicPath) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  // If accessing a public path and already authenticated, redirect to dashboard (optional)
  if (isPublicPath && accessToken && (pathname === '/login' || pathname === '/register')) {
    try {
      // Verify token validity
      const decoded = verifyToken(accessToken);
      if (decoded) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, continue to public page
    }
  }
  
  // If no token and trying to access protected path, redirect to login
  if (!accessToken && (isProtectedPath || requiredRoles)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // If token exists and path requires specific roles, verify role access
  if (accessToken && requiredRoles) {
    try {
      const decoded = verifyToken(accessToken);
      
      if (!decoded) {
        // Token invalid/expired
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      // Check if user has required role
      const userRole = decoded.roles;
      if (!userRole || !requiredRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // Token verification failed
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Helper function to verify and decode JWT token
function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
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