import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock next/headers for server components
vi.mock('next/headers', () => ({
    cookies: () => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    }),
    headers: () => new Map(),
}))

// Mock Appwrite client
vi.mock('@/lib/appwrite/client', () => ({
    getAccount: vi.fn(() => ({
        get: vi.fn(),
        createEmailPasswordSession: vi.fn(),
        deleteSession: vi.fn(),
    })),
    getClient: vi.fn(),
    getDatabases: vi.fn(),
    validateSession: vi.fn(() => Promise.resolve({ valid: false, user: null })),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))
