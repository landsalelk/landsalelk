"use server"

import { cookies } from "next/headers"

/**
 * Set session cookie server-side (HttpOnly for security)
 * This should be called after successful authentication
 */
export async function setSessionCookie(sessionSecret: string) {
    const cookieStore = await cookies()

    cookieStore.set('appwrite-session', sessionSecret, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, // Prevents XSS attacks from accessing session
    })
}

/**
 * Clear session cookie server-side
 */
export async function clearSessionCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('appwrite-session')
}

/**
 * Get session from cookie
 */
export async function getSessionCookie(): Promise<string | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get('appwrite-session')
    return session?.value ?? null
}
