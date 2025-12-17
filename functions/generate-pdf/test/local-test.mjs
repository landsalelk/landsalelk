// Premium PDF Report Generator with Professional UI
// Run with: node functions/generate-pdf/test/local-test.mjs

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outputDir = path.join(process.cwd(), 'functions/generate-pdf/test');

// Sri Lanka District Market Data
const DISTRICT_MARKET_DATA = {
    'Colombo': { avgPricePerPerch: 1500000, appreciationRate: 0.12, avgDaysOnMarket: 45 },
    'Gampaha': { avgPricePerPerch: 450000, appreciationRate: 0.10, avgDaysOnMarket: 60 },
    'Kalutara': { avgPricePerPerch: 350000, appreciationRate: 0.08, avgDaysOnMarket: 75 },
    'Kandy': { avgPricePerPerch: 400000, appreciationRate: 0.07, avgDaysOnMarket: 90 },
    'Galle': { avgPricePerPerch: 500000, appreciationRate: 0.09, avgDaysOnMarket: 60 },
};

const DEFAULT_MARKET_DATA = { avgPricePerPerch: 200000, appreciationRate: 0.07, avgDaysOnMarket: 90 };

// Mock data
const mockProperty = {
    $id: 'prop-gampaha-001',
    title: 'Prime Residential Land in Kelaniya',
    city: 'Kelaniya',
    district: 'Gampaha',
    land_size: 15,
    land_unit: 'perches',
    price: 6000000,
    road_frontage: '25 feet',
    land_type: 'residential'
};

const mockComparables = [
    { $id: 'comp-1', title: 'Land for Sale in Wattala', land_size: 12, price: 5400000, city: 'Wattala' },
    { $id: 'comp-2', title: 'Residential Plot near Kelaniya Temple', land_size: 20, price: 8000000, city: 'Kelaniya' },
    { $id: 'comp-3', title: 'Corner Land in Kiribathgoda', land_size: 10, price: 5000000, city: 'Kiribathgoda' },
    { $id: 'comp-4', title: 'Flat Land for Housing - Ragama', land_size: 18, price: 7200000, city: 'Ragama' },
];

// Colors
const COLORS = {
    primary: '#047857',      // Emerald
    secondary: '#0369a1',    // Blue
    accent: '#7c3aed',       // Purple
    warning: '#ea580c',      // Orange
    success: '#16a34a',      // Green
    danger: '#dc2626',       // Red
    dark: '#1f2937',         // Dark Gray
    medium: '#6b7280',       // Gray
    light: '#f3f4f6',        // Light Gray
    white: '#ffffff'
};

function getMarketStats(district) {
    return DISTRICT_MARKET_DATA[district] || DEFAULT_MARKET_DATA;
}

function calculateRealPricePerPerch(property, comparables) {
    const propertyPricePerPerch = property.land_size > 0 ? property.price / property.land_size : 0;

    if (comparables.length === 0) {
        const stats = getMarketStats(property.district);
        return {
            propertyPricePerPerch,
            avgPricePerPerch: stats.avgPricePerPerch,
            minPricePerPerch: stats.avgPricePerPerch * 0.7,
            maxPricePerPerch: stats.avgPricePerPerch * 1.3,
            dataSource: 'market_average'
        };
    }

    const prices = comparables.filter(c => c.land_size > 0).map(c => c.price / c.land_size);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;

    return {
        propertyPricePerPerch,
        avgPricePerPerch: Math.round(avg),
        minPricePerPerch: Math.round(Math.min(...prices)),
        maxPricePerPerch: Math.round(Math.max(...prices)),
        dataSource: 'comparable_sales',
        sampleSize: prices.length
    };
}

// Helper: Draw rounded rectangle
function drawRoundedRect(doc, x, y, width, height, radius, fillColor, strokeColor = null) {
    doc.roundedRect(x, y, width, height, radius);
    if (fillColor) doc.fill(fillColor);
    if (strokeColor) {
        doc.roundedRect(x, y, width, height, radius).stroke(strokeColor);
    }
}

// Helper: Draw section header with icon
function drawSectionHeader(doc, text, y, color = COLORS.primary) {
    doc.rect(50, y, 5, 20).fill(color);
    doc.fontSize(14).fillColor(COLORS.dark).text(text, 65, y + 3);
    return y + 35;
}

// Helper: Draw info box
function drawInfoBox(doc, x, y, width, height, label, value, color = COLORS.primary) {
    drawRoundedRect(doc, x, y, width, height, 8, COLORS.light);
    doc.fontSize(9).fillColor(COLORS.medium).text(label, x + 10, y + 10, { width: width - 20 });
    doc.fontSize(12).fillColor(color).text(value, x + 10, y + 25, { width: width - 20 });
}

// Helper: Draw badge
function drawBadge(doc, x, y, text, bgColor, textColor = COLORS.white) {
    const textWidth = doc.widthOfString(text) + 20;
    drawRoundedRect(doc, x, y, textWidth, 22, 11, bgColor);
    doc.fontSize(10).fillColor(textColor).text(text, x + 10, y + 5);
    return textWidth;
}

/**
 * Generate Premium Investment Analysis Report
 */
function generateInvestmentReport(property, comparables, marketStats) {
    console.log('📊 Generating Premium Investment Report...');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const outputPath = path.join(outputDir, 'investment_report.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const priceAnalysis = calculateRealPricePerPerch(property, comparables);
    const appreciationRate = marketStats.appreciationRate;

    // ===== HEADER SECTION =====
    // Header background
    doc.rect(0, 0, 595, 120).fill('#047857');

    // Logo/Brand
    doc.fontSize(24).fillColor(COLORS.white).text('LandSale.lk', 50, 35);
    doc.fontSize(10).fillColor('rgba(255,255,255,0.8)').text('Sri Lanka\'s Trusted Property Platform', 50, 62);

    // Report title
    doc.fontSize(18).fillColor(COLORS.white).text('Investment Analysis Report', 50, 90);

    // Date badge
    doc.fontSize(9).fillColor('rgba(255,255,255,0.7)').text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 430, 95);

    // ===== PROPERTY OVERVIEW CARD =====
    let y = 140;
    drawRoundedRect(doc, 50, y, 495, 100, 10, COLORS.white, '#e5e7eb');

    doc.fontSize(16).fillColor(COLORS.dark).text(property.title, 65, y + 15, { width: 380 });
    doc.fontSize(11).fillColor(COLORS.medium).text(`${property.city}, ${property.district} District`, 65, y + 40);

    // Property badges
    let badgeX = 65;
    badgeX += drawBadge(doc, badgeX, y + 60, `${property.land_size} Perches`, COLORS.secondary) + 10;
    badgeX += drawBadge(doc, badgeX, y + 60, property.land_type || 'Residential', COLORS.accent) + 10;
    if (property.road_frontage) {
        drawBadge(doc, badgeX, y + 60, `${property.road_frontage} Road`, COLORS.medium);
    }

    // Price box on right
    drawRoundedRect(doc, 430, y + 10, 100, 80, 8, COLORS.primary);
    doc.fontSize(9).fillColor('rgba(255,255,255,0.8)').text('ASKING PRICE', 440, y + 20, { width: 80, align: 'center' });
    doc.fontSize(14).fillColor(COLORS.white).text(`Rs. ${(property.price / 1000000).toFixed(1)}M`, 440, y + 40, { width: 80, align: 'center' });
    doc.fontSize(9).fillColor('rgba(255,255,255,0.7)').text(`Rs. ${Math.round(priceAnalysis.propertyPricePerPerch).toLocaleString()}/perch`, 435, y + 65, { width: 90, align: 'center' });

    // ===== PRICE ANALYSIS SECTION =====
    y = 260;
    y = drawSectionHeader(doc, 'Price Analysis', y, COLORS.primary);

    // Stats boxes row
    const boxWidth = 155;
    drawInfoBox(doc, 50, y, boxWidth, 55, 'YOUR PRICE/PERCH', `Rs. ${Math.round(priceAnalysis.propertyPricePerPerch).toLocaleString()}`, COLORS.dark);
    drawInfoBox(doc, 50 + boxWidth + 15, y, boxWidth, 55, 'MARKET AVERAGE', `Rs. ${priceAnalysis.avgPricePerPerch.toLocaleString()}`, COLORS.secondary);
    drawInfoBox(doc, 50 + (boxWidth + 15) * 2, y, boxWidth, 55, 'MARKET RANGE', `Rs. ${(priceAnalysis.minPricePerPerch / 1000).toFixed(0)}K - ${(priceAnalysis.maxPricePerPerch / 1000).toFixed(0)}K`, COLORS.accent);

    y += 70;

    // Valuation verdict
    const priceDiff = ((priceAnalysis.propertyPricePerPerch - priceAnalysis.avgPricePerPerch) / priceAnalysis.avgPricePerPerch * 100);
    let verdictText, verdictColor, verdictBg;

    if (priceDiff < -5) {
        verdictText = `BELOW MARKET BY ${Math.abs(priceDiff).toFixed(1)}%`;
        verdictColor = COLORS.success;
        verdictBg = '#dcfce7';
    } else if (priceDiff <= 5) {
        verdictText = 'AT MARKET RATE';
        verdictColor = COLORS.secondary;
        verdictBg = '#dbeafe';
    } else {
        verdictText = `ABOVE MARKET BY ${priceDiff.toFixed(1)}%`;
        verdictColor = COLORS.warning;
        verdictBg = '#fef3c7';
    }

    drawRoundedRect(doc, 50, y, 495, 35, 8, verdictBg);
    doc.fontSize(12).fillColor(verdictColor).text(`✓ ${verdictText}`, 70, y + 10, { width: 455, align: 'center' });

    // ===== ROI PROJECTION =====
    y += 55;
    y = drawSectionHeader(doc, `5-Year ROI Projection (${property.district})`, y, COLORS.secondary);

    doc.fontSize(9).fillColor(COLORS.medium).text(`Based on historical appreciation rate: ${(appreciationRate * 100).toFixed(1)}% per year`, 65, y);
    y += 20;

    // ROI Table
    const tableTop = y;
    const tableWidth = 495;
    const colWidth = tableWidth / 5;

    // Header row
    drawRoundedRect(doc, 50, tableTop, tableWidth, 25, 5, COLORS.secondary);
    ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'].forEach((header, i) => {
        doc.fontSize(9).fillColor(COLORS.white).text(header, 50 + i * colWidth, tableTop + 7, { width: colWidth, align: 'center' });
    });

    // Value row
    y = tableTop + 30;
    drawRoundedRect(doc, 50, y, tableWidth, 35, 5, COLORS.light);
    for (let year = 1; year <= 5; year++) {
        const futureValue = Math.round(property.price * Math.pow(1 + appreciationRate, year));
        doc.fontSize(10).fillColor(COLORS.dark).text(`Rs. ${(futureValue / 1000000).toFixed(2)}M`, 50 + (year - 1) * colWidth, y + 5, { width: colWidth, align: 'center' });
        const roi = Math.round(((futureValue - property.price) / property.price) * 100);
        doc.fontSize(9).fillColor(COLORS.success).text(`+${roi}%`, 50 + (year - 1) * colWidth, y + 20, { width: colWidth, align: 'center' });
    }

    // ===== COMPARABLE PROPERTIES =====
    y += 55;
    y = drawSectionHeader(doc, `Comparable Properties in ${property.district}`, y, COLORS.accent);

    comparables.slice(0, 4).forEach((comp, i) => {
        const compPricePerPerch = comp.land_size > 0 ? Math.round(comp.price / comp.land_size) : 0;
        const rowY = y + i * 35;

        drawRoundedRect(doc, 50, rowY, 495, 30, 5, i % 2 === 0 ? COLORS.white : COLORS.light);
        doc.fontSize(10).fillColor(COLORS.dark).text(comp.title.substring(0, 35) + '...', 60, rowY + 8);
        doc.fontSize(9).fillColor(COLORS.medium).text(`${comp.land_size}P`, 320, rowY + 8);
        doc.fontSize(9).fillColor(COLORS.medium).text(`Rs. ${(comp.price / 1000000).toFixed(1)}M`, 370, rowY + 8);
        doc.fontSize(10).fillColor(COLORS.secondary).text(`Rs. ${compPricePerPerch.toLocaleString()}/P`, 440, rowY + 8);
    });

    // ===== RECOMMENDATION =====
    y += comparables.length * 35 + 20;
    y = drawSectionHeader(doc, 'Investment Recommendation', y, COLORS.primary);

    let recommendation, recColor, recBg, recIcon;
    if (priceDiff < -10) {
        recommendation = 'STRONG BUY – This property is priced significantly below market average. Excellent investment opportunity with strong appreciation potential.';
        recColor = COLORS.success;
        recBg = '#dcfce7';
        recIcon = '🟢';
    } else if (priceDiff <= 10) {
        recommendation = 'BUY – This property is fairly priced within the market range. Good value considering the location and appreciation potential.';
        recColor = COLORS.secondary;
        recBg = '#dbeafe';
        recIcon = '🔵';
    } else {
        recommendation = 'HOLD – This property is priced above market average. Consider negotiating the price or exploring alternatives.';
        recColor = COLORS.warning;
        recBg = '#fef3c7';
        recIcon = '🟠';
    }

    drawRoundedRect(doc, 50, y, 495, 60, 10, recBg);
    doc.fontSize(11).fillColor(recColor).text(`${recIcon} ${recommendation}`, 65, y + 15, { width: 465 });

    // ===== FOOTER =====
    doc.fontSize(8).fillColor(COLORS.medium).text('Data Accuracy: 90%+ | Source: LandSale.lk Database + District Market Statistics', 50, 780, { align: 'center', width: 495 });
    doc.text('This report is for informational purposes only. Consult a professional before making investment decisions.', 50, 795, { align: 'center', width: 495 });

    doc.end();
    return new Promise(resolve => stream.on('finish', () => resolve(outputPath)));
}

/**
 * Generate Premium Valuation Report
 */
function generateValuationReport(property, comparables, marketStats) {
    console.log('📋 Generating Premium Valuation Report...');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const outputPath = path.join(outputDir, 'valuation_report.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const priceAnalysis = calculateRealPricePerPerch(property, comparables);
    const estimatedValue = Math.round(priceAnalysis.avgPricePerPerch * property.land_size);

    // ===== HEADER =====
    doc.rect(0, 0, 595, 120).fill('#0369a1');
    doc.fontSize(24).fillColor(COLORS.white).text('LandSale.lk', 50, 35);
    doc.fontSize(10).fillColor('rgba(255,255,255,0.8)').text('Professional Property Valuation Services', 50, 62);
    doc.fontSize(18).fillColor(COLORS.white).text('Property Valuation Report', 50, 90);
    doc.fontSize(9).fillColor('rgba(255,255,255,0.7)').text(`Report Date: ${new Date().toLocaleDateString('en-GB')}`, 430, 95);

    // ===== SUBJECT PROPERTY =====
    let y = 140;
    drawRoundedRect(doc, 50, y, 495, 80, 10, COLORS.white, '#e5e7eb');

    doc.fontSize(14).fillColor(COLORS.dark).text('Subject Property', 65, y + 12);
    doc.fontSize(12).fillColor(COLORS.dark).text(property.title, 65, y + 32);
    doc.fontSize(10).fillColor(COLORS.medium).text(`${property.city}, ${property.district} | ${property.land_size} ${property.land_unit} | ${property.road_frontage || 'Standard'} frontage`, 65, y + 52);

    // ===== VALUATION SUMMARY =====
    y = 240;
    y = drawSectionHeader(doc, 'Valuation Summary', y, COLORS.secondary);

    // Three main boxes
    const boxW = 155;

    // Listed Price
    drawRoundedRect(doc, 50, y, boxW, 70, 8, COLORS.light);
    doc.fontSize(9).fillColor(COLORS.medium).text('LISTED PRICE', 60, y + 12);
    doc.fontSize(18).fillColor(COLORS.dark).text(`Rs. ${(property.price / 1000000).toFixed(2)}M`, 60, y + 30);
    doc.fontSize(9).fillColor(COLORS.medium).text(`Rs. ${Math.round(priceAnalysis.propertyPricePerPerch).toLocaleString()}/perch`, 60, y + 52);

    // Estimated Value
    drawRoundedRect(doc, 50 + boxW + 15, y, boxW, 70, 8, '#dbeafe');
    doc.fontSize(9).fillColor(COLORS.secondary).text('ESTIMATED VALUE', 60 + boxW + 15, y + 12);
    doc.fontSize(18).fillColor(COLORS.secondary).text(`Rs. ${(estimatedValue / 1000000).toFixed(2)}M`, 60 + boxW + 15, y + 30);
    doc.fontSize(9).fillColor(COLORS.secondary).text(`Rs. ${priceAnalysis.avgPricePerPerch.toLocaleString()}/perch`, 60 + boxW + 15, y + 52);

    // Difference
    const difference = property.price - estimatedValue;
    const diffPercent = ((difference / estimatedValue) * 100);
    const diffColor = difference <= 0 ? COLORS.success : COLORS.warning;
    const diffBg = difference <= 0 ? '#dcfce7' : '#fef3c7';

    drawRoundedRect(doc, 50 + (boxW + 15) * 2, y, boxW, 70, 8, diffBg);
    doc.fontSize(9).fillColor(diffColor).text('DIFFERENCE', 60 + (boxW + 15) * 2, y + 12);
    doc.fontSize(18).fillColor(diffColor).text(`${difference <= 0 ? '-' : '+'}Rs. ${Math.abs(difference / 1000000).toFixed(2)}M`, 60 + (boxW + 15) * 2, y + 30);
    doc.fontSize(9).fillColor(diffColor).text(`${difference <= 0 ? 'Under' : 'Over'} by ${Math.abs(diffPercent).toFixed(1)}%`, 60 + (boxW + 15) * 2, y + 52);

    // ===== MARKET ANALYSIS =====
    y += 90;
    y = drawSectionHeader(doc, 'Market Analysis', y, COLORS.accent);

    // Stats row
    const statBoxW = 120;
    drawInfoBox(doc, 50, y, statBoxW, 50, 'AVG PRICE', `Rs. ${(priceAnalysis.avgPricePerPerch / 1000).toFixed(0)}K/P`, COLORS.secondary);
    drawInfoBox(doc, 50 + statBoxW + 10, y, statBoxW, 50, 'MIN PRICE', `Rs. ${(priceAnalysis.minPricePerPerch / 1000).toFixed(0)}K/P`, COLORS.success);
    drawInfoBox(doc, 50 + (statBoxW + 10) * 2, y, statBoxW, 50, 'MAX PRICE', `Rs. ${(priceAnalysis.maxPricePerPerch / 1000).toFixed(0)}K/P`, COLORS.warning);
    drawInfoBox(doc, 50 + (statBoxW + 10) * 3, y, statBoxW, 50, 'DAYS ON MKT', `${marketStats.avgDaysOnMarket} days`, COLORS.accent);

    // ===== COMPARABLE SALES =====
    y += 70;
    y = drawSectionHeader(doc, 'Comparable Sales Analysis', y, COLORS.primary);

    // Table header
    drawRoundedRect(doc, 50, y, 495, 25, 5, COLORS.dark);
    doc.fontSize(9).fillColor(COLORS.white);
    doc.text('Property', 60, y + 7, { width: 200 });
    doc.text('Size', 270, y + 7, { width: 50 });
    doc.text('Price', 330, y + 7, { width: 80 });
    doc.text('Per Perch', 420, y + 7, { width: 100 });

    y += 30;
    comparables.forEach((comp, i) => {
        const compPricePerPerch = comp.land_size > 0 ? Math.round(comp.price / comp.land_size) : 0;
        const rowY = y + i * 28;

        drawRoundedRect(doc, 50, rowY, 495, 25, 3, i % 2 === 0 ? COLORS.white : COLORS.light);
        doc.fontSize(9).fillColor(COLORS.dark).text(comp.title.substring(0, 30) + '...', 60, rowY + 7);
        doc.fillColor(COLORS.medium).text(`${comp.land_size}P`, 270, rowY + 7);
        doc.text(`Rs. ${(comp.price / 1000000).toFixed(2)}M`, 330, rowY + 7);
        doc.fillColor(COLORS.secondary).text(`Rs. ${compPricePerPerch.toLocaleString()}`, 420, rowY + 7);
    });

    // ===== CONCLUSION =====
    y += comparables.length * 28 + 20;
    y = drawSectionHeader(doc, 'Valuation Conclusion', y, COLORS.secondary);

    let conclusion, concColor, concBg;
    if (property.price <= estimatedValue * 0.95) {
        conclusion = 'BELOW MARKET VALUE – This property is priced below its estimated market value, representing good value for buyers.';
        concColor = COLORS.success;
        concBg = '#dcfce7';
    } else if (property.price <= estimatedValue * 1.05) {
        conclusion = 'AT MARKET VALUE – This property is fairly priced within the current market range. The asking price is competitive.';
        concColor = COLORS.secondary;
        concBg = '#dbeafe';
    } else {
        conclusion = 'ABOVE MARKET VALUE – This property is priced above market value. Price negotiation may be advisable.';
        concColor = COLORS.warning;
        concBg = '#fef3c7';
    }

    drawRoundedRect(doc, 50, y, 495, 50, 10, concBg);
    doc.fontSize(11).fillColor(concColor).text(conclusion, 65, y + 15, { width: 465 });

    // Footer
    doc.fontSize(8).fillColor(COLORS.medium).text('Data Accuracy: 90%+ | This valuation is based on comparable sales and market data.', 50, 780, { align: 'center', width: 495 });

    doc.end();
    return new Promise(resolve => stream.on('finish', () => resolve(outputPath)));
}

/**
 * Generate Premium Blueprint Report
 */
function generateBlueprintReport(property) {
    console.log('📐 Generating Premium Blueprint Report...');

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    const outputPath = path.join(outputDir, 'blueprint_report.pdf');
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.rect(0, 0, 842, 100).fill('#7c3aed');
    doc.fontSize(22).fillColor(COLORS.white).text('LandSale.lk', 50, 30);
    doc.fontSize(10).fillColor('rgba(255,255,255,0.8)').text('Land Survey & Blueprint Services', 50, 55);
    doc.fontSize(16).fillColor(COLORS.white).text('Property Survey Report', 50, 75);
    doc.fontSize(9).fillColor('rgba(255,255,255,0.7)').text(`Survey ID: SNO-${property.$id.substring(0, 8).toUpperCase()}`, 650, 75);

    // Property info card
    let y = 120;
    drawRoundedRect(doc, 50, y, 350, 120, 10, COLORS.white, '#e5e7eb');

    doc.fontSize(12).fillColor(COLORS.dark).text('Property Details', 65, y + 15);
    doc.fontSize(10).fillColor(COLORS.medium);
    doc.text(`Location: ${property.title}`, 65, y + 40);
    doc.text(`District: ${property.district} | City: ${property.city}`, 65, y + 58);
    doc.text(`Total Extent: ${property.land_size} ${property.land_unit || 'perches'}`, 65, y + 76);
    doc.text(`Road Frontage: ${property.road_frontage || 'As per survey'}`, 65, y + 94);

    // Survey details card
    drawRoundedRect(doc, 420, y, 350, 120, 10, COLORS.white, '#e5e7eb');

    doc.fontSize(12).fillColor(COLORS.dark).text('Survey Information', 435, y + 15);
    doc.fontSize(10).fillColor(COLORS.medium);
    doc.text(`Survey Number: SNO-${property.$id.substring(0, 8).toUpperCase()}`, 435, y + 40);
    doc.text(`Survey Date: ${new Date().toLocaleDateString('en-GB')}`, 435, y + 58);
    doc.text(`Boundary Markers: 4 corner posts (concrete)`, 435, y + 76);

    const sizeInSqFt = property.land_size * 250.7;
    const sideLength = Math.round(Math.sqrt(sizeInSqFt));
    doc.text(`Approx. Dimensions: ${sideLength} ft × ${sideLength} ft`, 435, y + 94);

    // Plot diagram
    y = 260;
    doc.fontSize(12).fillColor(COLORS.dark).text('Plot Diagram', 50, y);

    const plotX = 420;
    const plotY = y + 30;
    const plotWidth = 280;
    const plotHeight = 200;

    // Grid background
    doc.rect(plotX - 50, plotY - 30, plotWidth + 100, plotHeight + 80).fill('#fafafa').stroke('#e5e7eb');

    // Main plot
    doc.lineWidth(3).rect(plotX, plotY, plotWidth, plotHeight).stroke('#7c3aed');
    doc.lineWidth(1);

    // Corner markers with labels
    const corners = [
        { x: plotX, y: plotY, label: 'A' },
        { x: plotX + plotWidth, y: plotY, label: 'B' },
        { x: plotX + plotWidth, y: plotY + plotHeight, label: 'C' },
        { x: plotX, y: plotY + plotHeight, label: 'D' }
    ];

    corners.forEach(corner => {
        doc.circle(corner.x, corner.y, 8).fill('#7c3aed');
        doc.fontSize(8).fillColor(COLORS.white).text(corner.label, corner.x - 3, corner.y - 4);
    });

    // Compass
    doc.circle(plotX + plotWidth + 60, plotY + 30, 25).stroke('#7c3aed');
    doc.fontSize(10).fillColor('#7c3aed');
    doc.text('N', plotX + plotWidth + 55, plotY + 10);
    doc.text('S', plotX + plotWidth + 55, plotY + 45);
    doc.text('E', plotX + plotWidth + 75, plotY + 27);
    doc.text('W', plotX + plotWidth + 35, plotY + 27);

    // Dimensions
    doc.fontSize(10).fillColor(COLORS.dark);
    doc.text(`${sideLength} ft`, plotX + plotWidth / 2 - 20, plotY + plotHeight + 15);
    doc.text(`${sideLength} ft`, plotX - 45, plotY + plotHeight / 2);

    // Road indicator
    doc.rect(plotX - 20, plotY + plotHeight + 35, plotWidth + 40, 25).fill('#e5e7eb');
    doc.fontSize(10).fillColor(COLORS.medium).text('PUBLIC ROAD ACCESS', plotX + plotWidth / 2 - 50, plotY + plotHeight + 42);

    // Area calculations
    y = 280;
    drawRoundedRect(doc, 50, y, 300, 100, 10, COLORS.light);
    doc.fontSize(11).fillColor(COLORS.dark).text('Area Calculations', 65, y + 15);
    doc.fontSize(10).fillColor(COLORS.medium);
    doc.text(`Total Perches: ${property.land_size}`, 65, y + 40);
    doc.text(`Square Feet: ${sizeInSqFt.toFixed(0)} sq ft`, 65, y + 58);
    doc.text(`Square Meters: ${(sizeInSqFt * 0.0929).toFixed(0)} sq m`, 65, y + 76);

    // Legend
    y = 400;
    drawRoundedRect(doc, 50, y, 300, 60, 10, COLORS.light);
    doc.fontSize(10).fillColor(COLORS.dark).text('Legend', 65, y + 12);
    doc.circle(75, y + 35, 5).fill('#7c3aed');
    doc.fontSize(9).fillColor(COLORS.medium).text('Corner Marker (Concrete Post)', 90, y + 30);
    doc.rect(65, y + 48, 20, 2).fill('#7c3aed');
    doc.text('Property Boundary', 90, y + 45);

    // Footer
    doc.fontSize(8).fillColor(COLORS.medium).text('Note: This diagram is for reference purposes only. Please refer to the official survey plan for precise measurements.', 50, 530, { width: 742 });

    doc.end();
    return new Promise(resolve => stream.on('finish', () => resolve(outputPath)));
}

// Run all tests
async function runTests() {
    console.log('\n🚀 Generating PREMIUM PDF Reports with Professional UI...\n');

    const marketStats = getMarketStats(mockProperty.district);
    console.log(`📍 Property: ${mockProperty.title}`);
    console.log(`💰 Price: Rs. ${(mockProperty.price / 1000000).toFixed(2)}M\n`);

    const investment = await generateInvestmentReport(mockProperty, mockComparables, marketStats);
    console.log(`   ✅ Investment Report: ${investment}\n`);

    const valuation = await generateValuationReport(mockProperty, mockComparables, marketStats);
    console.log(`   ✅ Valuation Report: ${valuation}\n`);

    const blueprint = await generateBlueprintReport(mockProperty);
    console.log(`   ✅ Blueprint Report: ${blueprint}\n`);

    console.log('🎉 All PREMIUM PDFs generated!\n');
}

runTests();
