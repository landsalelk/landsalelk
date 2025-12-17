/**
 * Type definitions for error handling
 * Replaces `any` types in catch blocks for better type safety
 */

/**
 * Standard error shape for API/action responses
 */
export interface ActionError {
    message: string
    code?: string
    type?: string
    status?: number
}

/**
 * Appwrite-specific error structure
 */
export interface AppwriteError {
    message: string
    code: number
    type: string
    response?: {
        message: string
        code: number
        type: string
    }
}

/**
 * Type guard to check if error is an AppwriteError
 */
export function isAppwriteError(error: unknown): error is AppwriteError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'type' in error
    )
}

/**
 * Type guard for standard Error objects
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
    if (isAppwriteError(error)) {
        return error.message
    }
    if (isError(error)) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message)
    }
    return fallback
}

/**
 * Safely extract error code from unknown error type
 */
export function getErrorCode(error: unknown): string | undefined {
    if (isAppwriteError(error)) {
        return String(error.code)
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
        return String((error as { code: unknown }).code)
    }
    return undefined
}

/**
 * Type for action results with proper error handling
 */
export type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; code?: string }

/**
 * Helper to create success result
 */
export function success<T>(data?: T): ActionResult<T> {
    return data !== undefined ? { success: true, data } : { success: true }
}

/**
 * Helper to create error result
 */
export function failure(error: unknown, fallback?: string): ActionResult<never> {
    return {
        success: false,
        error: getErrorMessage(error, fallback),
        code: getErrorCode(error)
    }
}
