
import * as fs from 'fs';
import * as path from 'path';

interface VerifiedListing {
    title: string;
    category_id: string; // "49" or similar
    price: number;
    currency_code: string;
    images_source: string[];
    location: string; // JSON
}

async function main() {
    const dataPath = path.resolve('src/data/verified_import_listings.json');
    const reportPath = path.resolve('import_analysis_report.txt');

    if (!fs.existsSync(dataPath)) {
        console.error("Verified listings file not found. Run verify_import_data.ts first.");
        return;
    }

    const listings: VerifiedListing[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const categoryCounts: Record<string, number> = {};
    let totalImages = 0;
    let maxPrice = 0;
    let minPrice = Infinity;
    let zeroPriceCount = 0;
    let noImagesCount = 0;

    const lines: string[] = [];
    lines.push("=== IMPORT ANALYSIS REPORT ===");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Total Listings: ${listings.length}`);
    lines.push("");

    lines.push("--- Listing Preview (First 50) ---");
    lines.push(String("Title").padEnd(50) + " | " + String("Category").padEnd(10) + " | " + String("Price").padEnd(15) + " | Images");
    lines.push("-".repeat(90));

    for (const item of listings) {
        // Parse JSON title for EN
        let title = item.title;
        try {
            const t = JSON.parse(item.title);
            title = t.en || t.si || t.ta || "Unknown";
        } catch (e) { }

        const cat = item.category_id || "Unset";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        const imgCount = item.images_source.length;
        totalImages += imgCount;
        if (imgCount === 0) noImagesCount++;

        if (item.price === 0) zeroPriceCount++;
        if (item.price > maxPrice) maxPrice = item.price;
        if (item.price < minPrice && item.price > 0) minPrice = item.price;

        // Add to preview details
        if (lines.length < 60) { // Header + 50 items roughly
            lines.push(`${title.substring(0, 48).padEnd(50)} | ${cat.padEnd(10)} | ${String(item.price).padEnd(15)} | ${imgCount}`);
        }
    }

    if (listings.length > 50) {
        lines.push(`... and ${listings.length - 50} more items ...`);
    }

    lines.push("");
    lines.push("--- Statistics ---");
    lines.push(`Total Images to Download: ${totalImages}`);
    lines.push(`Listings without Images: ${noImagesCount}`);
    lines.push(`Listings with Price 0: ${zeroPriceCount}`);
    lines.push(`Price Range: ${minPrice === Infinity ? 0 : minPrice} - ${maxPrice}`);
    lines.push("");

    lines.push("--- Category Distribution ---");
    for (const [cat, count] of Object.entries(categoryCounts)) {
        lines.push(`Category ID '${cat}': ${count} listings`);
    }

    fs.writeFileSync(reportPath, lines.join('\n'));
    console.log(`Analysis report generated at: ${reportPath}`);
    console.log("Summary:");
    console.log(`- Total Listings: ${listings.length}`);
    console.log(`- Categories: ${Object.keys(categoryCounts).join(', ')}`);
}

main().catch(console.error);
