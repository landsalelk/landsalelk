import { getFeaturedProperties } from '@/lib/properties';

export default async function sitemap() {
    const baseUrl = 'https://landsale.lk';

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/properties`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
        { url: `${baseUrl}/agents`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic property pages
    let propertyPages = [];
    try {
        const properties = await getFeaturedProperties(100);
        propertyPages = properties.map((property) => ({
            url: `${baseUrl}/properties/${property.$id}`,
            lastModified: property.$updatedAt ? new Date(property.$updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));
    } catch (error) {
        // If fetching fails, continue with static pages only
    }

    return [...staticPages, ...propertyPages];
}
