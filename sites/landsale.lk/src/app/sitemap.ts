import { MetadataRoute } from 'next'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://landsale.lk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/properties`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/agents`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]

    // Dynamic property pages
    let propertyPages: MetadataRoute.Sitemap = []

    try {
        const { databases } = await createAdminClient()

        // Fetch all active property listings
        const listings = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            [
                Query.equal('status', 'active'),
                Query.orderDesc('$createdAt'),
                Query.limit(1000) // Adjust based on your needs
            ]
        )

        propertyPages = listings.documents.map((listing) => ({
            url: `${SITE_URL}/properties/${listing.$id}`,
            lastModified: new Date(listing.$updatedAt || listing.$createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    } catch (error) {
        console.error('Error generating sitemap for properties:', error)
    }

    // Combine all pages
    return [...staticPages, ...propertyPages]
}
