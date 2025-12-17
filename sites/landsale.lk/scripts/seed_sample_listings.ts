import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID!)
    .setKey(API_KEY!);

const databases = new Databases(client);

// Sample property listings for testing
const sampleListings = [
    {
        title: '20 Perch Land for Sale in Negombo',
        description: 'Prime residential land in a quiet neighborhood. Clear title deeds, all utilities available. Walking distance to schools and shops. Ideal for building your dream home.',
        category_id: 'land-sale',
        listing_type: 'sale',
        price: 8500000,
        location: 'Negombo, Gampaha',
        region: 'LK12',
        city: 'LK1207',
        features: ['Clear Title', 'Utilities Available', 'Near Schools', 'Quiet Area']
    },
    {
        title: 'Modern 3BR House in Colombo 7',
        description: 'Stunning modern house with 3 bedrooms, 2 bathrooms. Open-plan living, fully equipped kitchen, private garden, and parking for 2 cars. Prime Cinnamon Gardens location.',
        category_id: 'house-sale',
        listing_type: 'sale',
        price: 85000000,
        location: 'Cinnamon Gardens, Colombo 7',
        region: 'LK11',
        city: 'LK1103',
        features: ['3 Bedrooms', '2 Bathrooms', 'Garden', 'Parking', 'Modern Kitchen']
    },
    {
        title: 'Luxury Apartment for Rent - Colombo 3',
        description: 'Fully furnished 2BR apartment with sea view. Swimming pool, gym, 24/7 security. Premium building with all amenities. Perfect for expats or professionals.',
        category_id: 'apartment-rent',
        listing_type: 'rent',
        price: 250000,
        location: 'Kollupitiya, Colombo 3',
        region: 'LK11',
        city: 'LK1103',
        features: ['2 Bedrooms', 'Sea View', 'Pool', 'Gym', 'Furnished', '24/7 Security']
    },
    {
        title: '10 Acre Tea Estate in Nuwara Eliya',
        description: 'Profitable tea estate with beautiful mountain views. Includes workers quarters and processing facility. Well-maintained with high yield tea plants.',
        category_id: 'agricultural',
        listing_type: 'sale',
        price: 150000000,
        location: 'Nuwara Eliya',
        region: 'LK23',
        city: 'LK2304',
        features: ['10 Acres', 'Mountain View', 'Workers Quarters', 'Processing Facility', 'High Yield']
    },
    {
        title: 'Commercial Building for Sale - Kandy',
        description: '3-story commercial building in prime Kandy location. Currently rented with steady income. Ground floor retail space, offices above. Excellent investment opportunity.',
        category_id: 'commercial',
        listing_type: 'sale',
        price: 120000000,
        location: 'Kandy City Center',
        region: 'LK21',
        city: 'LK2104',
        features: ['3 Floors', 'Prime Location', 'Rental Income', 'Retail Space', 'Office Space']
    },
    {
        title: 'Beach Front Land in Mirissa',
        description: '50 perch beachfront property with stunning ocean views. Perfect for resort or boutique hotel development. Rare opportunity in sought-after tourist location.',
        category_id: 'land-sale',
        listing_type: 'sale',
        price: 75000000,
        location: 'Mirissa, Matara',
        region: 'LK32',
        city: 'LK3213',
        features: ['Beach Front', 'Ocean View', '50 Perches', 'Tourist Area', 'Development Ready']
    },
    {
        title: 'Cozy Room for Rent - Dehiwala',
        description: 'Furnished room with attached bathroom. WiFi included, shared kitchen. Quiet residential area, close to train station. Ideal for working professionals.',
        category_id: 'room-rent',
        listing_type: 'rent',
        price: 25000,
        location: 'Dehiwala, Colombo',
        region: 'LK11',
        city: 'LK1127',
        features: ['Furnished', 'Attached Bathroom', 'WiFi', 'Near Station', 'Kitchen Access']
    },
    {
        title: 'Industrial Warehouse - Kelaniya',
        description: 'Modern warehouse with 10,000 sq ft space. High ceiling, loading dock, office space included. Easy access to Colombo and highways. Suitable for manufacturing or storage.',
        category_id: 'industrial',
        listing_type: 'rent',
        price: 500000,
        location: 'Kelaniya Industrial Zone',
        region: 'LK12',
        city: 'LK1202',
        features: ['10000 sqft', 'Loading Dock', 'Office Space', 'Highway Access', 'High Ceiling']
    },
    {
        title: 'New Apartment in Battaramulla',
        description: 'Brand new 2BR apartment in modern complex. Excellent finishes, balcony with green views. Swimming pool, kids play area. Minutes from Parliament Road.',
        category_id: 'apartment-sale',
        listing_type: 'sale',
        price: 28000000,
        location: 'Battaramulla',
        region: 'LK11',
        city: 'LK1127',
        features: ['2 Bedrooms', 'Balcony', 'Pool', 'Kids Area', 'New Construction']
    },
    {
        title: 'Family House for Rent - Rajagiriya',
        description: 'Spacious 4BR house with large garden. Perfect for families, quiet neighborhood, good schools nearby. Semi-furnished with AC in all rooms.',
        category_id: 'house-rent',
        listing_type: 'rent',
        price: 180000,
        location: 'Rajagiriya',
        region: 'LK11',
        city: 'LK1127',
        features: ['4 Bedrooms', 'Large Garden', 'AC', 'Good Schools', 'Semi-furnished']
    }
];

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   SEED SAMPLE PROPERTY LISTINGS       ║');
    console.log('╚═══════════════════════════════════════╝\n');

    let created = 0;

    for (let i = 0; i < sampleListings.length; i++) {
        const listing = sampleListings[i];
        const listingId = `sample-${i + 1}`;

        const data = {
            user_id: 'system-demo',
            category_id: listing.category_id,
            title: listing.title,
            description: listing.description,
            slug: listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100),
            listing_type: listing.listing_type,
            status: 'active',
            price: listing.price,
            currency_code: 'LKR',
            price_negotiable: true,
            location: listing.location,
            contact: '+94 77 123 4567',
            is_premium: i < 3, // First 3 are premium
            attributes: JSON.stringify({ region: listing.region, city: listing.city }),
            features: listing.features.join(', '),
            images: [],
            auction_enabled: false,
            views_count: Math.floor(Math.random() * 500) + 50,
            bid_count: 0,
            verification_requested: i < 5,
            verification_paid: i < 2,
            is_boosted: i < 2
        };

        try {
            await databases.createDocument(DB_ID, 'listings', listingId, data);
            console.log(`✅ Created: ${listing.title.substring(0, 40)}...`);
            created++;
        } catch (e: any) {
            if (e.code === 409) {
                await databases.updateDocument(DB_ID, 'listings', listingId, data);
                console.log(`🔄 Updated: ${listing.title.substring(0, 40)}...`);
                created++;
            } else {
                console.log(`❌ Failed: ${e.message}`);
            }
        }
    }

    console.log(`\n✓ Sample listings: ${created} created`);
}

main().catch(console.error);
