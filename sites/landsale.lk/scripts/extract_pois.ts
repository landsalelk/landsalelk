import fs from 'fs';
import path from 'path';

interface POI {
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    city?: string;
    district?: string;
}

// Parse GeoNames data for POIs
function extractPOIs(): Map<string, POI[]> {
    const filePath = path.join(process.cwd(), 'docs/LK_geonames/LK.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').filter(l => l.trim());

    const pois = new Map<string, POI[]>();

    // Feature codes we're interested in
    const educationCodes = ['SCH', 'SCHC', 'SCHL', 'SCHT', 'UNIV'];
    const healthCodes = ['HSP', 'HSPC', 'HSPD', 'HSPL', 'CTRM'];
    const transportCodes = ['AIRP', 'AIRQ', 'BUSTN', 'RSTN', 'PORT'];
    const religiousCodes = ['MSQE', 'TMPL', 'CH', 'SHRN'];
    const commercialCodes = ['MKT', 'BANK', 'HTL', 'RST'];
    const governmentCodes = ['ADM1', 'ADM2', 'ADM3', 'ADM4', 'PSTC'];

    const interestingCodes = [
        ...educationCodes,
        ...healthCodes,
        ...transportCodes,
        ...religiousCodes,
        ...commercialCodes,
        ...governmentCodes
    ];

    for (const line of lines) {
        const fields = line.split('\t');
        const featureCode = fields[7]?.trim();

        if (!interestingCodes.includes(featureCode)) continue;

        const name = fields[1]?.trim();
        const lat = parseFloat(fields[4]) || 0;
        const lng = parseFloat(fields[5]) || 0;

        if (!name || !lat || !lng) continue;

        let category = 'Other';
        if (educationCodes.includes(featureCode)) category = 'Education';
        else if (healthCodes.includes(featureCode)) category = 'Healthcare';
        else if (transportCodes.includes(featureCode)) category = 'Transport';
        else if (religiousCodes.includes(featureCode)) category = 'Religious';
        else if (commercialCodes.includes(featureCode)) category = 'Commercial';
        else if (governmentCodes.includes(featureCode)) category = 'Government';

        const poi: POI = {
            name,
            category,
            latitude: lat,
            longitude: lng,
            district: fields[11]?.trim() || undefined
        };

        if (!pois.has(category)) {
            pois.set(category, []);
        }
        pois.get(category)!.push(poi);
    }

    return pois;
}

console.log('=== Extracting Points of Interest ===\n');

const pois = extractPOIs();

console.log('POIs by Category:');
for (const [category, items] of pois.entries()) {
    console.log(`  ${category}: ${items.length}`);
}

// Save to JSON files for later use
const poisDir = path.join(process.cwd(), 'docs/pois');
if (!fs.existsSync(poisDir)) {
    fs.mkdirSync(poisDir, { recursive: true });
}

for (const [category, items] of pois.entries()) {
    const filename = `${category.toLowerCase()}_pois.json`;
    fs.writeFileSync(
        path.join(poisDir, filename),
        JSON.stringify(items, null, 2)
    );
    console.log(`✓ Saved ${filename}`);
}

// Create summary
const summary = {
    total: Array.from(pois.values()).reduce((sum, items) => sum + items.length, 0),
    byCategory: Object.fromEntries(
        Array.from(pois.entries()).map(([cat, items]) => [cat, items.length])
    )
};

fs.writeFileSync(
    path.join(poisDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
);

console.log(`\n✓ Total POIs extracted: ${summary.total}`);
console.log('✓ Saved to docs/pois/');
