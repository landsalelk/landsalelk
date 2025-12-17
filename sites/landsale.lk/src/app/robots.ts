import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://landsale.lk'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard/',
                    '/auth/',
                    '/_next/',
                    '/test*',
                    '/debug*',
                    '/ping*',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/dashboard/', '/auth/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
