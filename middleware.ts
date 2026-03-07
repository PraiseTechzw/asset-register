import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value || '';
    const isLoginPage = request.nextUrl.pathname === '/login';

    // If there's no token and user is trying to access a protected page
    if (!token && !isLoginPage && !request.nextUrl.pathname.startsWith('/api/auth')) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If there's a token and user is trying to access the login page
    if (token && isLoginPage) {
        const dashboardUrl = new URL('/', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (local images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};
