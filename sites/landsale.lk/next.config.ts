import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },

      {
        protocol: 'http',
        hostname: 'appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io',
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
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      }
    ],
  },
  output: 'standalone',
  // Reduce source map noise in development
  productionBrowserSourceMaps: false,
  // CSP header to allow required external connections
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.appwrite.io https://cloud.appwrite.io https://api.openai.com https://*.upstash.io; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.appwrite.io https://cloud.appwrite.io wss://*.appwrite.io https://api.openai.com https://*.upstash.io https://mpc-prod-18-s6uit34pua-uc.a.run.app https://demo-1.conversionsapigateway.com;"
          },
        ],
      },
    ];
  },
};

export default nextConfig;