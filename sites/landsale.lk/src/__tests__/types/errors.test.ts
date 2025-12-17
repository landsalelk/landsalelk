import { describe, it, expect } from 'vitest'
import { getErrorMessage, getErrorCode, isAppwriteError, isError, success, failure } from '@/types/errors'

describe('Error Utilities', () => {
    describe('getErrorMessage', () => {
        it('should extract message from Appwrite error', () => {
            const error = { message: 'User not found', code: 404, type: 'user_not_found' }
            expect(getErrorMessage(error)).toBe('User not found')
        })

        it('should extract message from Error object', () => {
            const error = new Error('Something went wrong')
            expect(getErrorMessage(error)).toBe('Something went wrong')
        })

        it('should return string errors as-is', () => {
            expect(getErrorMessage('Direct error message')).toBe('Direct error message')
        })

        it('should return fallback for unknown error types', () => {
            expect(getErrorMessage(null, 'Fallback message')).toBe('Fallback message')
            expect(getErrorMessage(undefined, 'Fallback message')).toBe('Fallback message')
            expect(getErrorMessage(42, 'Fallback message')).toBe('Fallback message')
        })

        it('should extract message from objects with message property', () => {
            const error = { message: 'Custom error object' }
            expect(getErrorMessage(error)).toBe('Custom error object')
        })
    })

    describe('getErrorCode', () => {
        it('should extract code from Appwrite error', () => {
            const error = { message: 'Not found', code: 404, type: 'not_found' }
            expect(getErrorCode(error)).toBe('404')
        })

        it('should extract code from object with code property', () => {
            const error = { code: 'AUTH_FAILED' }
            expect(getErrorCode(error)).toBe('AUTH_FAILED')
        })

        it('should return undefined for errors without code', () => {
            expect(getErrorCode(new Error('test'))).toBeUndefined()
            expect(getErrorCode('string error')).toBeUndefined()
        })
    })

    describe('isAppwriteError', () => {
        it('should return true for Appwrite-like errors', () => {
            const error = { message: 'Error', code: 401, type: 'unauthorized' }
            expect(isAppwriteError(error)).toBe(true)
        })

        it('should return false for regular errors', () => {
            expect(isAppwriteError(new Error('test'))).toBe(false)
            expect(isAppwriteError({ message: 'test' })).toBe(false)
            expect(isAppwriteError(null)).toBe(false)
        })
    })

    describe('isError', () => {
        it('should return true for Error instances', () => {
            expect(isError(new Error('test'))).toBe(true)
            expect(isError(new TypeError('type error'))).toBe(true)
        })

        it('should return false for non-Error objects', () => {
            expect(isError({ message: 'test' })).toBe(false)
            expect(isError('string')).toBe(false)
        })
    })

    describe('success helper', () => {
        it('should create success result without data', () => {
            expect(success()).toEqual({ success: true })
        })

        it('should create success result with data', () => {
            expect(success({ id: '123' })).toEqual({ success: true, data: { id: '123' } })
        })
    })

    describe('failure helper', () => {
        it('should create failure result from Error', () => {
            const result = failure(new Error('Something failed'))
            expect(result.success).toBe(false)
            expect(result.error).toBe('Something failed')
        })

        it('should create failure result from Appwrite error', () => {
            const result = failure({ message: 'Auth failed', code: 401, type: 'unauthorized' })
            expect(result.success).toBe(false)
            expect(result.error).toBe('Auth failed')
            expect(result.code).toBe('401')
        })

        it('should use fallback for unknown errors', () => {
            const result = failure(null, 'Default error')
            expect(result.error).toBe('Default error')
        })
    })
})
