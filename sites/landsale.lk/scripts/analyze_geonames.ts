import fs from 'fs';
import path from 'path';

// Analyze both GeoNames datasets
console.log('=== Analyzing GeoNames Data ===\n');

// 1. Postal Codes Data
console.log('--- POSTAL CODES (LK_postcodes/LK.txt) ---');
const postcodesPath = path.join(process.cwd(), 'docs/LK_postcodes/LK.txt');
const postcodesData = fs.readFileSync(postcodesPath, 'utf8');
const postcodesLines = postcodesData.split('\n').filter(l => l.trim());
console.log(`Total records: ${postcodesLines.length}`);

// Show structure
const samplePostal = postcodesLines[0].split('\t');
console.log('Fields:', samplePostal.length);
console.log('Sample:', postcodesLines[0]);
console.log('\nField structure (tab-separated):');
console.log('0: country code, 1: postal code, 2: place name, 3: admin name1 (province)');
console.log('4: admin code1, 5: admin name2 (district), 6: admin code2, 7: admin name3');
console.log('8: admin code3, 9: latitude, 10: longitude, 11: accuracy\n');

// 2. Full GeoNames Data
console.log('--- FULL GEONAMES (LK_geonames/LK.txt) ---');
const geonamesPath = path.join(process.cwd(), 'docs/LK_geonames/LK.txt');
const geonamesData = fs.readFileSync(geonamesPath, 'utf8');
const geonamesLines = geonamesData.split('\n').filter(l => l.trim());
console.log(`Total records: ${geonamesLines.length}`);

// Show structure
const sampleGeo = geonamesLines[0].split('\t');
console.log('Fields:', sampleGeo.length);
console.log('Sample (first 10 fields):', geonamesLines[0].substring(0, 150) + '...');
console.log('\nField structure (tab-separated):');
console.log('0: geonameid, 1: name, 2: asciiname, 3: alternatenames, 4: latitude, 5: longitude');
console.log('6: feature class, 7: feature code, 8: country code, 9: cc2, 10: admin1 code');
console.log('11: admin2 code, 12: admin3 code, 13: admin4 code, 14: population');
console.log('15: elevation, 16: dem, 17: timezone, 18: modification date\n');

// Extract unique locations with postcodes
console.log('--- ANALYSIS ---');
const postcodesByDistrict: { [key: string]: number } = {};
postcodesLines.forEach(line => {
    const fields = line.split('\t');
    const district = fields[5] || 'Unknown';
    postcodesByDistrict[district] = (postcodesByDistrict[district] || 0) + 1;
});

console.log('\nPostcodes by District:');
Object.entries(postcodesByDistrict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([district, count]) => {
        console.log(`  ${district}: ${count}`);
    });

// Save summary
const summary = {
    postcodes: {
        total: postcodesLines.length,
        byDistrict: postcodesByDistrict
    },
    geonames: {
        total: geonamesLines.length
    }
};

fs.writeFileSync('docs/geonames_summary.json', JSON.stringify(summary, null, 2));
console.log('\n✓ Saved summary to docs/geonames_summary.json');
