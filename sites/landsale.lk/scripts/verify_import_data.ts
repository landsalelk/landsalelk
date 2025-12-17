
import * as fs from 'fs';
import * as path from 'path';

// --- Types ---

interface APIImage {
    id: number;
    url: string;
}

interface APILocation {
    country: string;
    region: string;
    city: string;
    city_area: string;
    address: string;
}

interface APIListing {
    id: number;
    title: string;
    description: string;
    price: number | null;
    currency: string;
    category: { id: number; name: string };
    user_id: number;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    location: APILocation;
    published_date: string;
    premium: boolean;
    active: boolean;
    images: APIImage[];
    views: number;
}

interface APIResponse {
    status: string;
    data: {
        items: APIListing[];
    };
}

// Full Appwrite-compatible listing with ALL fields
interface AppwriteListingComplete {
    // Required fields
    user_id: string;
    category_id: string;
    title: string; // JSON I18n
    description: string; // JSON I18n
    slug: string;
    listing_type: 'sale' | 'rent' | 'wanted';
    status: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected';
    price: number;
    currency_code: string;
    price_negotiable: boolean;
    location: string; // JSON
    contact: string; // JSON
    is_premium: boolean;
    views_count: number;
    expires_at: string;
    ip_address: string;
    auction_enabled: boolean;
    bid_count: number;

    // Optional fields
    team_id?: string;
    attributes?: string; // JSON
    features?: string[];
    images_source: string[]; // Temp: source URLs for downloading
    videos?: string[];
    published_at?: string;
    min_bid_amount?: number;
    current_bid_amount?: number;
    auction_ends_at?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string[];
}

// --- Configuration ---

const CATEGORY_MAP: Record<number, string> = {
    49: 'land',
    43: 'houses',
    50: 'other', // Office/Commercial
};

const DEFAULT_CATEGORY = 'other';
const DEFAULT_USER_ID = 'imported_listing';

// --- Helpers ---

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .substring(0, 50);
}

function extractKeywords(title: string): string[] {
    const stopWords = ['for', 'sale', 'in', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'with'];
    return title
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word))
        .slice(0, 5);
}

function generateFakePrice(): number {
    // Generate realistic Sri Lankan property prices (in LKR)
    const ranges = [
        { min: 500000, max: 2000000 },    // Small land plots
        { min: 2000000, max: 10000000 },  // Medium properties
        { min: 10000000, max: 50000000 }, // Houses
        { min: 50000000, max: 250000000 },// Premium
    ];
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
}

function mapListing(item: APIListing): AppwriteListingComplete {
    const titleJson = JSON.stringify({ en: item.title });
    const descriptionJson = JSON.stringify({ en: item.description.substring(0, 5000) }); // Limit length

    const locationJson = JSON.stringify({
        country: item.location.country || 'Sri Lanka',
        country_name: 'Sri Lanka',
        region: item.location.region || '',
        city: item.location.city || '',
        area: item.location.city_area || '',
        address: item.location.address || '',
    });

    const contactJson = JSON.stringify({
        name: item.contact_name,
        email: item.contact_email,
        phone: item.contact_phone,
        show_email: true,
        show_phone: true,
    });

    // Generate or use price
    const price = item.price && item.price > 0 ? item.price : generateFakePrice();

    // SEO fields
    const seoTitle = JSON.stringify({ en: item.title.substring(0, 60) });
    const seoDesc = JSON.stringify({ en: item.description.substring(0, 155) });

    return {
        // Required with API data
        user_id: DEFAULT_USER_ID,
        category_id: CATEGORY_MAP[item.category.id] || DEFAULT_CATEGORY,
        title: titleJson,
        description: descriptionJson,
        slug: `${slugify(item.title)}-${item.id}`,
        listing_type: 'sale',
        status: item.active ? 'active' : 'draft',
        price: price,
        currency_code: item.currency || 'LKR',
        price_negotiable: true,
        location: locationJson,
        contact: contactJson,
        is_premium: item.premium || false,
        views_count: item.views || 0,

        // Filled with defaults/fake
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        ip_address: '127.0.0.1',
        auction_enabled: false,
        bid_count: 0,

        // Optional fields
        attributes: JSON.stringify({}),
        features: [],
        images_source: item.images.map(img => img.url),
        videos: [],
        published_at: item.published_date ? new Date(item.published_date).toISOString() : new Date().toISOString(),
        seo_title: seoTitle,
        seo_description: seoDesc,
        seo_keywords: extractKeywords(item.title),
    };
}

// --- Main ---

async function main() {
    const inputPath = path.resolve('temp_listings.json');
    const outputPath = path.resolve('src/data/verified_import_listings.json');
    const reportPath = path.resolve('schema_fill_report.txt');

    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exit(1);
    }

    console.log(`Reading from ${inputPath}...`);
    const rawData: APIResponse = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

    if (!rawData.data?.items) {
        console.error("Invalid JSON structure");
        process.exit(1);
    }

    const items = rawData.data.items;
    console.log(`Found ${items.length} listings.`);

    const mappedListings: AppwriteListingComplete[] = [];
    const report: string[] = [
        '=== SCHEMA FILL REPORT ===',
        `Generated: ${new Date().toISOString()}`,
        `Total Items: ${items.length}`,
        '',
        'Fields filled with defaults/fake data:',
        '- slug: Generated from title + ID',
        '- listing_type: "sale"',
        '- price_negotiable: true',
        '- expires_at: +1 year from now',
        '- ip_address: "127.0.0.1"',
        '- auction_enabled: false',
        '- bid_count: 0',
        '- attributes: {}',
        '- features: []',
        '- videos: []',
        '- seo_title: From title (truncated)',
        '- seo_description: From description (truncated)',
        '- seo_keywords: Extracted from title',
        '',
        '--- Price Generation ---',
    ];

    let pricesGenerated = 0;

    for (const item of items) {
        const hadPrice = item.price && item.price > 0;
        const mapped = mapListing(item);
        mappedListings.push(mapped);

        if (!hadPrice) {
            pricesGenerated++;
        }
    }

    report.push(`Prices generated for ${pricesGenerated} / ${items.length} listings`);

    fs.writeFileSync(outputPath, JSON.stringify(mappedListings, null, 2));
    fs.writeFileSync(reportPath, report.join('\n'));

    console.log(`\n✅ Successfully wrote ${mappedListings.length} complete listings to ${outputPath}`);
    console.log(`📄 Schema fill report saved to ${reportPath}`);

    // Sample verification
    const sample = mappedListings[0];
    console.log('\n--- Sample (First Item) ---');
    console.log('Slug:', sample.slug);
    console.log('Price:', sample.price, sample.currency_code);
    console.log('Expires:', sample.expires_at);
    console.log('SEO Keywords:', sample.seo_keywords);
}

main().catch(console.error);
