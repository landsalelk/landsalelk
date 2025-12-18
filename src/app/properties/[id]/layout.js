import { getPropertyById } from '@/lib/properties';

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
        const property = await getPropertyById(params.id);

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

        // Get first image for OG
        let images = [];
        try {
            const parsedImages = JSON.parse(property.images || '[]');
            if (parsedImages.length > 0) {
                images = [{ url: parsedImages[0], width: 1200, height: 630 }];
            }
        } catch (e) {
            // Invalid JSON, skip images
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                url: `https://landsale.lk/properties/${params.id}`,
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
