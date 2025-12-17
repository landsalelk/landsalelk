'use client'

import { useEffect } from 'react'
import { validateSession } from '@/lib/appwrite/client'
import { clearSessionCookie } from '@/lib/actions/session'
import { useRouter, usePathname } from 'next/navigation'

/**
 * SessionManager - Automatically checks session validity
 * Clears invalid sessions and redirects on protected routes
 */
export function SessionManager() {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Initial check
        const checkSession = async () => {
            const { valid } = await validateSession()

            if (!valid) {
                // Session expired or invalid
                await clearSessionCookie()

                // Only redirect if on protected route
                if (pathname.startsWith('/dashboard')) {
                    router.push(`/login?redirect=${pathname}`)
                }
            }
        }

        checkSession()

        // Check session every 5 minutes
        const interval = setInterval(async () => {
            const { valid } = await validateSession()

            if (!valid) {
                // Session expired, clear cookie
                await clearSessionCookie()

                // Only redirect if on protected route
                if (pathname.startsWith('/dashboard')) {
                    router.push(`/login?redirect=${pathname}`)
                }
            }
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(interval)
    }, [router, pathname])

    return null
}
