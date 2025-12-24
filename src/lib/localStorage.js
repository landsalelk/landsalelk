/**
 * Safe localStorage utility for handling private browsing and other edge cases
 * Use this instead of direct localStorage access
 */

/**
 * Safely get item from localStorage
 * @param {string} key - The key to retrieve
 * @returns {string|null} - The stored value or null if not available
 */
export function safeGetItem(key) {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(key);
    } catch (e) {
        // localStorage not available (private browsing, etc.)
        console.warn("localStorage not available:", e.message);
        return null;
    }
}

/**
 * Safely set item in localStorage
 * @param {string} key - The key to set
 * @param {string} value - The value to store
 * @returns {boolean} - Whether the operation succeeded
 */
export function safeSetItem(key, value) {
    if (typeof window === 'undefined') return false;
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        // localStorage not available or quota exceeded
        console.warn("localStorage not available:", e.message);
        return false;
    }
}

/**
 * Safely remove item from localStorage
 * @param {string} key - The key to remove
 * @returns {boolean} - Whether the operation succeeded
 */
export function safeRemoveItem(key) {
    if (typeof window === 'undefined') return false;
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.warn("localStorage not available:", e.message);
        return false;
    }
}

/**
 * Safely get and parse JSON from localStorage
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - Default value if not found or parsing fails
 * @returns {*} - The parsed value or default
 */
export function safeGetJSON(key, defaultValue = null) {
    const stored = safeGetItem(key);
    if (!stored) return defaultValue;
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.warn("Failed to parse stored JSON:", e.message);
        return defaultValue;
    }
}

/**
 * Safely stringify and store JSON in localStorage
 * @param {string} key - The key to set
 * @param {*} value - The value to stringify and store
 * @returns {boolean} - Whether the operation succeeded
 */
export function safeSetJSON(key, value) {
    try {
        return safeSetItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("Failed to stringify value:", e.message);
        return false;
    }
}
