import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Appwrite handles sessions via the 'appwrite-session' cookie
    // Unlike Supabase, we don't need to refresh tokens server-side in middleware
    // The session cookie is automatically sent with requests

    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // === SECURITY HEADERS ===
    // Content Security Policy
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https: http:",
        "connect-src 'self' https://*.appwrite.io https://cloud.appwrite.io wss://*.appwrite.io https://api.openai.com https://*.upstash.io",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ')

    response.headers.set('Content-Security-Policy', cspDirectives)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

    // HSTS - only in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    // Optional: Protect dashboard routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const sessionCookie = request.cookies.get('appwrite-session')

    if (isProtectedRoute && !sessionCookie) {
        // Redirect to login if trying to access protected route without session
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Prevent logged-in users from accessing auth pages
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/forgot-password')

    if (isAuthPage && sessionCookie) {
        // User already logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
