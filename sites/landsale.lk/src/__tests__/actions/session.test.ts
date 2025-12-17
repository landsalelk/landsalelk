import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock cookies before importing the module
const mockCookies = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
}

vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve(mockCookies),
}))

// Import after mocking
import { setSessionCookie, clearSessionCookie, getSessionCookie } from '@/lib/actions/session'

describe('Session Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('setSessionCookie', () => {
        it('should set cookie with correct options', async () => {
            await setSessionCookie('test-session-secret')

            expect(mockCookies.set).toHaveBeenCalledWith(
                'appwrite-session',
                'test-session-secret',
                expect.objectContaining({
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30,
                    sameSite: 'lax',
                    httpOnly: true,
                })
            )
        })
    })

    describe('clearSessionCookie', () => {
        it('should delete the session cookie', async () => {
            await clearSessionCookie()

            expect(mockCookies.delete).toHaveBeenCalledWith('appwrite-session')
        })
    })

    describe('getSessionCookie', () => {
        it('should return session value when cookie exists', async () => {
            mockCookies.get.mockReturnValue({ value: 'existing-session' })

            const result = await getSessionCookie()

            expect(result).toBe('existing-session')
            expect(mockCookies.get).toHaveBeenCalledWith('appwrite-session')
        })

        it('should return null when cookie does not exist', async () => {
            mockCookies.get.mockReturnValue(undefined)

            const result = await getSessionCookie()

            expect(result).toBeNull()
        })
    })
})
