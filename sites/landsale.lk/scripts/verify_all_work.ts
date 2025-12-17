import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';
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

interface VerificationResult {
    category: string;
    item: string;
    expected: string;
    actual: string;
    status: '✅' | '❌' | '⚠️';
}

const results: VerificationResult[] = [];

function addResult(category: string, item: string, expected: string, actual: string, passed: boolean | 'partial') {
    results.push({
        category,
        item,
        expected,
        actual,
        status: passed === true ? '✅' : passed === 'partial' ? '⚠️' : '❌'
    });
}

async function verifyCollections() {
    console.log('\n📊 Verifying Collections...\n');

    const collections = await databases.listCollections(DB_ID);
    addResult('Database', 'Collections exist', '20+', String(collections.total), collections.total >= 20);

    // Check for removed duplicate collections
    const duplicates = ['provinces', 'districts', 'ds_divisions', 'gn_divisions'];
    let duplicatesRemoved = true;

    for (const dup of duplicates) {
        const exists = collections.collections.some(c => c.$id === dup);
        if (exists) {
            duplicatesRemoved = false;
            addResult('Cleanup', `Duplicate "${dup}" removed`, 'Deleted', 'Still exists', false);
        }
    }

    if (duplicatesRemoved) {
        addResult('Cleanup', 'Duplicate collections removed', '4 removed', '4 removed', true);
    }
}

async function verifyLocationData() {
    console.log('📍 Verifying Location Data...\n');

    // Countries
    try {
        const countries = await databases.listDocuments(DB_ID, 'countries', [Query.limit(10)]);
        addResult('Location', 'Countries', '1 (Sri Lanka)', String(countries.total), countries.total >= 1);

        if (countries.total > 0) {
            const lk = countries.documents.find(d => d.$id === 'LK');
            addResult('Location', 'Sri Lanka seeded', 'Full data', lk?.native_name ? 'Yes' : 'No', !!lk?.native_name);
        }
    } catch (e) {
        addResult('Location', 'Countries', '1', 'Error', false);
    }

    // Regions
    try {
        const regions = await databases.listDocuments(DB_ID, 'regions', [Query.limit(100)]);
        addResult('Location', 'Regions (Districts)', '25', String(regions.total), regions.total === 25);

        // Check enrichment
        const withCoords = regions.documents.filter(r => r.latitude && r.longitude).length;
        const withPostal = regions.documents.filter(r => r.postal_code).length;
        addResult('Location', 'Regions with coordinates', '25', String(withCoords), withCoords >= 20 ? true : withCoords >= 10 ? 'partial' : false);
        addResult('Location', 'Regions with postal codes', '25', String(withPostal), withPostal >= 20 ? true : withPostal >= 10 ? 'partial' : false);
    } catch (e) {
        addResult('Location', 'Regions', '25', 'Error', false);
    }

    // Cities
    try {
        const cities = await databases.listDocuments(DB_ID, 'cities', [Query.limit(1)]);
        addResult('Location', 'Cities (DS Divisions)', '339', String(cities.total), cities.total >= 300);
    } catch (e) {
        addResult('Location', 'Cities', '339', 'Error', false);
    }

    // Areas
    try {
        const areas = await databases.listDocuments(DB_ID, 'areas', [Query.limit(1)]);
        addResult('Location', 'Areas (GN Divisions)', '14000+', String(areas.total),
            areas.total >= 13000 ? true : areas.total >= 5000 ? 'partial' : false);
    } catch (e) {
        addResult('Location', 'Areas', '14000', 'Error', false);
    }
}

async function verifyContentData() {
    console.log('📝 Verifying Content Data...\n');

    // Categories
    try {
        const categories = await databases.listDocuments(DB_ID, 'categories', [Query.limit(20)]);
        addResult('Content', 'Categories', '10', String(categories.total), categories.total >= 10);
    } catch (e) {
        addResult('Content', 'Categories', '10', 'Error', false);
    }

    // FAQs
    try {
        const faqs = await databases.listDocuments(DB_ID, 'faqs', [Query.limit(20)]);
        addResult('Content', 'FAQs', '8', String(faqs.total), faqs.total >= 8);
    } catch (e) {
        addResult('Content', 'FAQs', '8', 'Error', false);
    }

    // CMS Pages
    try {
        const cms = await databases.listDocuments(DB_ID, 'cms_pages', [Query.limit(20)]);
        addResult('Content', 'CMS Pages', '4', String(cms.total), cms.total >= 4);
    } catch (e) {
        addResult('Content', 'CMS Pages', '4', 'Error', false);
    }

    // Settings
    try {
        const settings = await databases.listDocuments(DB_ID, 'settings', [Query.limit(20)]);
        addResult('Content', 'Settings', '10', String(settings.total), settings.total >= 10);
    } catch (e) {
        addResult('Content', 'Settings', '10', 'Error', false);
    }

    // Sample Listings
    try {
        const listings = await databases.listDocuments(DB_ID, 'listings', [Query.limit(20)]);
        addResult('Content', 'Sample Listings', '10', String(listings.total), listings.total >= 10);
    } catch (e) {
        addResult('Content', 'Sample Listings', '10', 'Error', false);
    }
}

async function verifyIndexes() {
    console.log('🔍 Verifying Indexes...\n');

    const collectionsToCheck = ['listings', 'categories', 'regions', 'cities', 'areas'];
    let totalIndexes = 0;

    for (const colId of collectionsToCheck) {
        try {
            const indexes = await databases.listIndexes(DB_ID, colId);
            totalIndexes += indexes.total;
        } catch (e) {
            // Skip if collection doesn't exist
        }
    }

    addResult('Indexes', 'Database indexes created', '15+', String(totalIndexes),
        totalIndexes >= 15 ? true : totalIndexes >= 5 ? 'partial' : false);
}

function verifyFiles() {
    console.log('📁 Verifying Files...\n');

    const requiredFiles = [
        { path: 'src/hooks/useAppwriteRealtime.ts', desc: 'Realtime hooks' },
        { path: 'src/components/features/realtime/RealtimeComponents.tsx', desc: 'Realtime components' },
        { path: 'docs/REALTIME_GUIDE.md', desc: 'Realtime guide' },
        { path: 'docs/DATABASE_ANALYSIS_REPORT.md', desc: 'DB analysis report' },
        { path: 'docs/APPWRITE_AUDIT_REPORT.md', desc: 'Appwrite audit' },
        { path: 'docs/LOCATION_DATA_SUMMARY.md', desc: 'Location summary' },
        { path: 'docs/pois/summary.json', desc: 'POI data extracted' }
    ];

    for (const file of requiredFiles) {
        const fullPath = path.join(process.cwd(), file.path);
        const exists = fs.existsSync(fullPath);
        addResult('Files', file.desc, 'Exists', exists ? 'Yes' : 'Missing', exists);
    }
}

async function verifyDataQuality() {
    console.log('✨ Verifying Data Quality...\n');

    // Check if regions have all required fields
    try {
        const regions = await databases.listDocuments(DB_ID, 'regions', [Query.limit(5)]);
        if (regions.documents.length > 0) {
            const sample = regions.documents[0];
            const hasName = !!sample.name;
            const hasCountry = !!sample.country_id && !!sample.country_code;
            const hasSlug = !!sample.slug;

            addResult('Quality', 'Region data structure', 'Complete',
                hasName && hasCountry && hasSlug ? 'Valid' : 'Incomplete',
                hasName && hasCountry && hasSlug);
        }
    } catch (e) {
        addResult('Quality', 'Region data structure', 'Valid', 'Error', false);
    }

    // Check relationship integrity
    try {
        const cities = await databases.listDocuments(DB_ID, 'cities', [Query.limit(5)]);
        let validRelations = 0;

        for (const city of cities.documents) {
            if (city.region_id) {
                try {
                    await databases.getDocument(DB_ID, 'regions', city.region_id);
                    validRelations++;
                } catch (e) {
                    // Invalid relationship
                }
            }
        }

        addResult('Quality', 'City→Region relationships', '100%',
            `${Math.round((validRelations / cities.documents.length) * 100)}%`,
            validRelations === cities.documents.length);
    } catch (e) {
        addResult('Quality', 'Relationships', 'Valid', 'Error', false);
    }
}

function printReport() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              VERIFICATION REPORT                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');

    // Summary
    const passed = results.filter(r => r.status === '✅').length;
    const partial = results.filter(r => r.status === '⚠️').length;
    const failed = results.filter(r => r.status === '❌').length;
    const total = results.length;
    const score = Math.round(((passed + partial * 0.5) / total) * 100);

    console.log(`📊 OVERALL SCORE: ${score}%`);
    console.log(`   ✅ Passed:  ${passed}`);
    console.log(`   ⚠️  Partial: ${partial}`);
    console.log(`   ❌ Failed:  ${failed}`);
    console.log('─'.repeat(65));

    // Group by category
    const categories = [...new Set(results.map(r => r.category))];

    for (const category of categories) {
        console.log(`\n📁 ${category.toUpperCase()}`);
        console.log('─'.repeat(65));

        const categoryResults = results.filter(r => r.category === category);

        for (const result of categoryResults) {
            console.log(`${result.status} ${result.item.padEnd(35)} Expected: ${result.expected.padEnd(12)} Actual: ${result.actual}`);
        }
    }

    // Summary
    console.log('\n');
    console.log('═'.repeat(65));

    if (score >= 90) {
        console.log('🎉 EXCELLENT! All systems are working correctly.');
    } else if (score >= 70) {
        console.log('👍 GOOD! Most features are working. Check warnings above.');
    } else if (score >= 50) {
        console.log('⚠️  NEEDS ATTENTION! Several items need fixing.');
    } else {
        console.log('❌ CRITICAL! Many items failed. Review errors above.');
    }

    console.log('═'.repeat(65));
    console.log('');

    // Save report
    const reportPath = path.join(process.cwd(), 'docs/VERIFICATION_REPORT.md');
    const reportContent = generateMarkdownReport(score, passed, partial, failed, results);
    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 Full report saved to: docs/VERIFICATION_REPORT.md`);
}

function generateMarkdownReport(score: number, passed: number, partial: number, failed: number, results: VerificationResult[]): string {
    const lines: string[] = [];

    lines.push('# ✅ Verification Report\n');
    lines.push(`**Generated**: ${new Date().toLocaleString()}\n`);
    lines.push(`**Score**: ${score}%\n`);
    lines.push('---\n');

    lines.push('## Summary\n');
    lines.push(`- ✅ **Passed**: ${passed}`);
    lines.push(`- ⚠️ **Partial**: ${partial}`);
    lines.push(`- ❌ **Failed**: ${failed}\n`);

    lines.push('## Detailed Results\n');

    const categories = [...new Set(results.map(r => r.category))];

    for (const category of categories) {
        lines.push(`\n### ${category}\n`);
        lines.push('| Status | Item | Expected | Actual |');
        lines.push('|--------|------|----------|--------|');

        const categoryResults = results.filter(r => r.category === category);
        for (const result of categoryResults) {
            lines.push(`| ${result.status} | ${result.item} | ${result.expected} | ${result.actual} |`);
        }
    }

    return lines.join('\n');
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   COMPREHENSIVE VERIFICATION          ║');
    console.log('╚═══════════════════════════════════════╝');

    await verifyCollections();
    await verifyLocationData();
    await verifyContentData();
    await verifyIndexes();
    verifyFiles();
    await verifyDataQuality();

    printReport();
}

main().catch(console.error);
