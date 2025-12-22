import { getPropertyById } from '@/lib/properties';
import { BUCKET_LISTING_IMAGES } from '@/appwrite/config';

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
        // In Next.js 15 params may be a promise; await it to avoid sync dynamic API error.
        const resolvedParams = await params;
        const propertyId = resolvedParams?.id;
        if (!propertyId) {
            return {
                title: 'Property | LandSale.lk',
                description: 'View property details on LandSale.lk',
            };
        }

        const property = await getPropertyById(propertyId);

        if (!property) {
            return {
                title: 'Property Not Found | LandSale.lk',
                description: 'The requested property could not be found.',
            };
        }

        const parsedTitle = parseSafe(property.title, 'Property');
        const parsedDescription = parseSafe(property.description, '');

        const title = `${parsedTitle} | LandSale.lk`;
        const description = parsedDescription
            ? parsedDescription.slice(0, 160)
            : `${property.listing_type || 'Property'} in ${property.city || 'Sri Lanka'} - ${property.price ? `LKR ${property.price.toLocaleString()}` : 'Contact for price'}`;

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
        const resolveImg = (val) => {
            if (!val) return null;
            const str = String(val).trim();
            if (!str) return null;
            if (str.startsWith('http')) return str;
            return `${endpoint}/storage/buckets/${BUCKET_LISTING_IMAGES}/files/${str}/view?project=${projectId}`;
        };

        // Get first image for OG
        let images = [];
        try {
            const raw =
                property.images ||
                property.image_urls ||
                property.imageIds ||
                property.image_ids ||
                property.imageUrls;

            let arr = [];
            if (Array.isArray(raw)) arr = raw;
            else if (typeof raw === 'string') {
                if (raw.trim().startsWith('[')) {
                    arr = JSON.parse(raw);
                } else {
                    arr = raw.split(',').map((s) => s.trim());
                }
            }

            const firstUrl = arr.map(resolveImg).filter(Boolean)[0];
            if (firstUrl) {
                images = [{ url: firstUrl, width: 1200, height: 630 }];
            }
        } catch (e) {
            // Invalid images, skip
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                url: `https://landsale.lk/properties/${propertyId}`,
                images,
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
            },
        };
    } catch (error) {
        return {
            title: 'Property | LandSale.lk',
            description: 'View property details on LandSale.lk',
        };
    }
}

export default function PropertyLayout({ children }) {
    return children;
}
