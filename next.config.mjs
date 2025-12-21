/** @type {import('next').NextConfig} */
const nextConfig = {
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
<<<<<<< HEAD
=======
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d
        ],
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: false, // Changed to enforce linting during builds
    },
};


// Force server restart: 2025-12-19
export default nextConfig;