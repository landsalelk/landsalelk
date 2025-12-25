import { getPropertyById } from '@/lib/properties';
import { BUCKET_LISTING_IMAGES } from '@/appwrite/config';
import { storage } from '@/lib/appwrite';

// Helper to safely parse JSON strings (for i18n fields)
const parseSafe = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'object') {
        // Already an object, extract en or first value
        if (val.en) return val.en;
        return Object.values(val)[0] || fallback;
    }
    try {
        if (typeof val === 'string' && val.startsWith('{')) {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed === 'object') {
                return parsed.en || parsed.si || Object.values(parsed)[0] || val;
            }
        }
    } catch (e) { }
    return val;
};

export async function generateMetadata({ params }) {
    try {
        const resolvedParams = await params;
        const propertyId = resolvedParams?.id;
        if (!propertyId) return defaultMetadata;

        const property = await getPropertyById(propertyId);
        if (!property) return defaultMetadata;

        const parsedTitle = parseSafe(property.title, 'Property');
        let parsedDescription = parseSafe(property.description, '');

        // Clean description (remove markdown/html roughly, limit length)
        parsedDescription = parsedDescription
            .replace(/[#*`]/g, '') // Remove markdown chars
            .replace(/\n+/g, ' ')  // Replace newlines with space
            .trim()
            .substring(0, 160);

        if (!parsedDescription) {
            parsedDescription = `${property.listing_type || 'Property'} in ${property.city || property.location || 'Sri Lanka'} - ${property.price ? `LKR ${property.price.toLocaleString()}` : 'Contact for price'}`;
        }

        const title = `${parsedTitle} | LandSale.lk`;

        // Resolve Image URL using SDK
        let images = [];
        try {
            const raw = property.images || property.image_ids || [];
            let imageId = null;

            if (Array.isArray(raw) && raw.length > 0) {
                imageId = raw[0];
            } else if (typeof raw === 'string' && raw.trim().length > 0) {
                // Handle stringified array or single ID
                if (raw.trim().startsWith('[')) {
                    const arr = JSON.parse(raw);
                    if (arr.length > 0) imageId = arr[0];
                } else if (!raw.includes(',')) {
                    imageId = raw; // Single ID
                } else {
                    imageId = raw.split(',')[0].trim();
                }
            }

            if (imageId) {
                // Check if it's already a URL (rare but possible)
                if (imageId.startsWith('http')) {
                    images = [{ url: imageId, width: 1200, height: 630 }];
                } else {
                    // Use SDK to generate view URL
                    const url = storage.getFileView(BUCKET_LISTING_IMAGES, imageId);
                    images = [{ url: url.href, width: 1200, height: 630 }];
                }
            }
        } catch (e) {
            console.error('Metadata image error:', e);
        }

        return {
            title,
            description: parsedDescription,
            openGraph: {
                title,
                description: parsedDescription,
                type: 'website',
                url: `https://landsale.lk/properties/${propertyId}`,
                images,
                siteName: 'LandSale.lk',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description: parsedDescription,
                images: images.length > 0 ? [images[0].url] : [],
            },
        };
    } catch (error) {
        console.error('Metadata generation error:', error);
        return defaultMetadata;
    }
}

export default async function PropertyLayout({ children, params }) {
    const resolvedParams = await params;
    const propertyId = resolvedParams?.id;
    let schemaData = null;

    if (propertyId) {
        try {
            const property = await getPropertyById(propertyId);
            if (property) {
                const { APPWRITE_ENDPOINT } = await import('@/appwrite/config');
                const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

                // Resolve Image
                let imageUrl = '';
                try {
                    const raw = property.images || property.image_ids || [];
                    let imageId = Array.isArray(raw) ? raw[0] : (typeof raw === 'string' ? raw.split(',')[0] : null);
                    if (imageId) {
                        imageUrl = imageId.startsWith('http')
                            ? imageId
                            : `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_LISTING_IMAGES}/files/${imageId}/view?project=${projectId}`;
                    }
                } catch (e) { }

                schemaData = {
                    "@context": "https://schema.org",
                    "@type": "RealEstateListing",
                    "name": property.title,
                    "description": property.description ? property.description.substring(0, 160) : "",
                    "image": imageUrl ? [imageUrl] : [],
                    "url": `https://landsale.lk/properties/${propertyId}`,
                    "datePosted": property.$createdAt,
                    "price": property.price,
                    "priceCurrency": "LKR",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": property.city || property.location || "Sri Lanka",
                        "addressCountry": "LK"
                    }
                };
            }
        } catch (e) {
            console.error('Schema generation error:', e);
        }
    }

    return (
        <>
            {schemaData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />
            )}
            {children}
        </>
    );
}
