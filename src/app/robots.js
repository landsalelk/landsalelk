export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/dashboard/', '/auth/'],
            },
        ],
        sitemap: 'https://landsale.lk/sitemap.xml',
    };
}
