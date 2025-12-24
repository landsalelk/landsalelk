/**
 * Shared date formatting utilities for consistent date display across the app
 */

/**
 * Format a date for display in a human-readable short format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Dec 24, 2025")
 */
export function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format a date with time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted datetime string (e.g., "Dec 24, 2025, 2:30 PM")
 */
export function formatDateTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Format a relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;

    return formatDate(date);
}

/**
 * Format just the time portion
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get year from date (for "Member since 2023" etc.)
 * @param {string|Date} date - The date to extract year from
 * @returns {number|null} Year or null
 */
export function getYear(date) {
    if (!date) return null;
    return new Date(date).getFullYear();
}

/**
 * Format a date range
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date
 * @returns {string} Formatted range (e.g., "Dec 24 - Dec 31, 2025")
 */
export function formatDateRange(start, end) {
    if (!start || !end) return '';

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getFullYear() === endDate.getFullYear()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
}
