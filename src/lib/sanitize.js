"use client";

/**
 * HTML Sanitization Utility
 * Uses DOMPurify to prevent XSS attacks when rendering HTML content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML string to sanitize
 * @returns {string} - Sanitized HTML safe for dangerouslySetInnerHTML
 */
export function sanitizeHTML(html) {
    if (typeof window === 'undefined') {
        // Server-side: return as-is (will be sanitized on client hydration)
        return html || '';
    }
    return DOMPurify.sanitize(html || '', {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'img', 'blockquote',
            'pre', 'code', 'hr', 'table', 'thead', 'tbody',
            'tr', 'th', 'td', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
    });
}

/**
 * Creates sanitized props for dangerouslySetInnerHTML
 * @param {string} html - Raw HTML string
 * @returns {object} - Props object for dangerouslySetInnerHTML
 */
export function createSanitizedMarkup(html) {
    return { __html: sanitizeHTML(html) };
}
