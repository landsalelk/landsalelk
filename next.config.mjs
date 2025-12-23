import fs from 'fs';
import path from 'path';

// Read appwrite.json
const appwritePath = path.resolve(process.cwd(), 'appwrite.json');
const appwriteConfig = JSON.parse(fs.readFileSync(appwritePath, 'utf-8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_APPWRITE_ENDPOINT: appwriteConfig.endpoint,
        NEXT_PUBLIC_APPWRITE_PROJECT_ID: appwriteConfig.projectId,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'cloud.appwrite.io',
            },
            {
                protocol: 'https',
                hostname: 'sgp.cloud.appwrite.io',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
        ],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: false, // Changed to enforce linting during builds
    },
};


import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

// Force server restart: 2025-12-22
export default bundleAnalyzer(nextConfig);