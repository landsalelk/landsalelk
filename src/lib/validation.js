/**
 * Validates and sanitizes numeric input
 * @param {any} value - The value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum allowed value
 * @param {number} options.max - Maximum allowed value
 * @param {boolean} options.allowZero - Whether zero is allowed
 * @returns {number|null} - Validated number or null if invalid
 */
export function validateNumericInput(value, options = {}) {
    const { min, max, allowZero = true } = options;
    
    // Handle null/undefined/empty values
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    // Convert to number
    const num = typeof value === 'number' ? value : parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(num)) {
        return null;
    }
    
    // Check zero allowance
    if (num === 0 && !allowZero) {
        return null;
    }
    
    // Check min/max bounds
    if (min !== undefined && num < min) {
        return null;
    }
    
    if (max !== undefined && num > max) {
        return null;
    }
    
    return num;
}

/**
 * Validates and sanitizes phone number input
 * @param {string} phone - The phone number to validate
 * @returns {string|null} - Validated phone number or null if invalid
 */
export function validatePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        return null;
    }
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Check if it's a valid Sri Lankan phone number format
    // +94 followed by 9 digits, or 0 followed by 9 digits
    const slPhoneRegex = /^(\+94\d{9}|0\d{9})$/;
    
    if (slPhoneRegex.test(cleaned)) {
        return cleaned;
    }
    
    return null;
}