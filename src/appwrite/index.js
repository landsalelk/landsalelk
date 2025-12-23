/**
 * Appwrite SDK Module Entry Point
 *
 * This module unifies the Appwrite client initialization and configuration.
 * It re-exports the initialized client from `@/lib/appwrite` to ensure a singleton instance
 * across the application, along with configuration constants and utility functions.
 *
 * @module Appwrite
 */

export * from '../lib/appwrite';
export * from './config.js';
export * from './functions.js';
