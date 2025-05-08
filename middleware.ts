import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(next: NextRequest) {
    return NextResponse.redirect(new URL('/login', next.url))
}

export const config = {
    matcher: '/staff/:path*',
}