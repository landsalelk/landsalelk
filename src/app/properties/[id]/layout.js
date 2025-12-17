import { getPropertyById } from '@/lib/properties';

export async function generateMetadata({ params }) {
    try {
        const property = await getPropertyById(params.id);

        if (!property) {
            return {
                title: 'Property Not Found | LandSale.lk',
                description: 'The requested property could not be found.',
            };
        }

        const title = `${property.title} | LandSale.lk`;
        const description = property.description
            ? property.description.slice(0, 160)
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
