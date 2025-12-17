import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DB_ID = 'landsalelkdb';

if (!PROJECT_ID || !API_KEY) {
    console.error('Missing config');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

interface CollectionAnalysis {
    name: string;
    id: string;
    totalDocuments: number;
    attributes: any[];
    fieldCompleteness: { [key: string]: number };
    sampleData: any[];
    dataQuality: {
        emptyFields: string[];
        duplicateCheck: boolean;
        relationshipIntegrity: any;
    };
}

async function analyzeCollection(collectionId: string, collectionName: string): Promise<CollectionAnalysis> {
    console.log(`\n📊 Analyzing: ${collectionName} (${collectionId})`);

    // Get collection schema
    const attributes = await databases.listAttributes(DB_ID, collectionId);
    console.log(`  ├─ Attributes: ${attributes.total}`);

    // Get total document count
    const docs = await databases.listDocuments(DB_ID, collectionId, [Query.limit(100)]);
    const totalDocs = docs.total;
    console.log(`  ├─ Documents: ${totalDocs}`);

    // Analyze field completeness
    const fieldCompleteness: { [key: string]: number } = {};
    const attributeKeys = attributes.attributes.map((attr: any) => attr.key);

    for (const attr of attributes.attributes as any[]) {
        let filledCount = 0;
        for (const doc of docs.documents) {
            if (doc[attr.key] !== null && doc[attr.key] !== undefined && doc[attr.key] !== '') {
                filledCount++;
            }
        }
        fieldCompleteness[attr.key] = docs.documents.length > 0
            ? Math.round((filledCount / docs.documents.length) * 100)
            : 0;
    }

    // Get sample data
    const sampleData = docs.documents.slice(0, 3);

    // Check for empty fields
    const emptyFields = Object.entries(fieldCompleteness)
        .filter(([key, percentage]) => percentage === 0)
        .map(([key]) => key);

    console.log(`  └─ Analysis complete`);

    return {
        name: collectionName,
        id: collectionId,
        totalDocuments: totalDocs,
        attributes: attributes.attributes,
        fieldCompleteness,
        sampleData,
        dataQuality: {
            emptyFields,
            duplicateCheck: false, // Placeholder
            relationshipIntegrity: {}
        }
    };
}

async function checkRelationships() {
    console.log('\n🔗 Checking Relationship Integrity...');

    const issues: string[] = [];

    // Check regions -> country
    try {
        const regions = await databases.listDocuments(DB_ID, 'regions', [Query.limit(100)]);
        for (const region of regions.documents) {
            if (region.country_id && region.country_code) {
                // Valid
            } else {
                issues.push(`Region ${region.name} missing country reference`);
            }
        }
    } catch (e: any) {
        issues.push(`Regions check failed: ${e.message}`);
    }

    // Check cities -> regions
    try {
        const cities = await databases.listDocuments(DB_ID, 'cities', [Query.limit(100)]);
        for (const city of cities.documents) {
            if (!city.region_id) {
                issues.push(`City ${city.name} missing region_id`);
                continue;
            }

            try {
                await databases.getDocument(DB_ID, 'regions', city.region_id);
            } catch {
                issues.push(`City ${city.name} has invalid region_id: ${city.region_id}`);
            }
        }
    } catch (e: any) {
        issues.push(`Cities check failed: ${e.message}`);
    }

    // Check areas -> cities
    try {
        const areas = await databases.listDocuments(DB_ID, 'areas', [Query.limit(50)]);
        for (const area of areas.documents) {
            if (!area.city_id) {
                issues.push(`Area ${area.name} missing city_id`);
                continue;
            }

            try {
                await databases.getDocument(DB_ID, 'cities', area.city_id);
            } catch {
                issues.push(`Area ${area.name} has invalid city_id: ${area.city_id}`);
            }
        }
    } catch (e: any) {
        issues.push(`Areas check failed: ${e.message}`);
    }

    return issues;
}

async function generateReport(analyses: CollectionAnalysis[], relationshipIssues: string[]) {
    const report: string[] = [];

    report.push('# 🔍 Complete Database Analysis Report\n');
    report.push(`**Generated**: ${new Date().toLocaleString()}\n`);
    report.push(`**Database**: ${DB_ID}\n`);
    report.push('---\n');

    // Summary
    report.push('## 📊 Summary\n');
    const totalDocs = analyses.reduce((sum, a) => sum + a.totalDocuments, 0);
    report.push(`**Total Documents**: ${totalDocs.toLocaleString()}\n`);
    report.push(`**Total Collections**: ${analyses.length}\n\n`);

    report.push('| Collection | Documents | Attributes | Completeness |\n');
    report.push('|------------|-----------|------------|-------------|\n');

    for (const analysis of analyses) {
        const avgCompleteness = Object.values(analysis.fieldCompleteness)
            .reduce((sum, val) => sum + val, 0) / Object.keys(analysis.fieldCompleteness).length;
        report.push(`| ${analysis.name} | ${analysis.totalDocuments.toLocaleString()} | ${analysis.attributes.length} | ${Math.round(avgCompleteness)}% |\n`);
    }

    report.push('\n---\n');

    // Detailed Analysis per Collection
    report.push('## 📋 Detailed Collection Analysis\n');

    for (const analysis of analyses) {
        report.push(`\n### ${analysis.name} Collection\n`);
        report.push(`**ID**: \`${analysis.id}\`\n`);
        report.push(`**Total Documents**: ${analysis.totalDocuments.toLocaleString()}\n\n`);

        // Attributes
        report.push('#### Attributes\n');
        report.push('| Field | Type | Required | Completeness |\n');
        report.push('|-------|------|----------|-------------|\n');

        for (const attr of analysis.attributes) {
            const completeness = analysis.fieldCompleteness[attr.key] || 0;
            const completenessBadge = completeness >= 80 ? '✅' : completeness >= 50 ? '⚠️' : '❌';
            report.push(`| ${attr.key} | ${attr.type} | ${attr.required ? '✓' : '-'} | ${completenessBadge} ${completeness}% |\n`);
        }

        // Data Quality Issues
        if (analysis.dataQuality.emptyFields.length > 0) {
            report.push(`\n**⚠️ Empty Fields**: ${analysis.dataQuality.emptyFields.join(', ')}\n`);
        }

        // Sample Data
        if (analysis.sampleData.length > 0) {
            report.push('\n#### Sample Data\n');
            report.push('```json\n');
            report.push(JSON.stringify(analysis.sampleData[0], null, 2));
            report.push('\n```\n');
        }
    }

    // Relationship Analysis
    report.push('\n---\n');
    report.push('## 🔗 Relationship Integrity\n');

    if (relationshipIssues.length === 0) {
        report.push('✅ All relationships are valid!\n');
    } else {
        report.push(`⚠️ Found ${relationshipIssues.length} issues:\n\n`);
        for (const issue of relationshipIssues.slice(0, 20)) {
            report.push(`- ${issue}\n`);
        }
        if (relationshipIssues.length > 20) {
            report.push(`\n... and ${relationshipIssues.length - 20} more issues\n`);
        }
    }

    // Recommendations
    report.push('\n---\n');
    report.push('## 💡 Recommendations\n');

    for (const analysis of analyses) {
        const avgCompleteness = Object.values(analysis.fieldCompleteness)
            .reduce((sum, val) => sum + val, 0) / Object.keys(analysis.fieldCompleteness).length;

        if (avgCompleteness < 70) {
            report.push(`\n### ${analysis.name}\n`);
            report.push(`- **Data Completeness**: ${Math.round(avgCompleteness)}% (Target: 80%+)\n`);

            const incompleteFields = Object.entries(analysis.fieldCompleteness)
                .filter(([key, val]) => val < 50)
                .map(([key]) => key);

            if (incompleteFields.length > 0) {
                report.push(`- **Incomplete Fields**: ${incompleteFields.join(', ')}\n`);
                report.push(`- **Action**: Consider enriching these fields or making them optional\n`);
            }
        }
    }

    // Performance Metrics
    report.push('\n---\n');
    report.push('## ⚡ Performance Metrics\n');
    report.push(`- **Largest Collection**: ${analyses.sort((a, b) => b.totalDocuments - a.totalDocuments)[0]?.name} (${analyses[0]?.totalDocuments.toLocaleString()} docs)\n`);
    report.push(`- **Most Attributes**: ${analyses.sort((a, b) => b.attributes.length - a.attributes.length)[0]?.name} (${analyses[0]?.attributes.length} fields)\n`);

    return report.join('');
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   COMPLETE DATABASE ANALYSIS TOOL     ║');
    console.log('╚═══════════════════════════════════════╝');

    // Get all collections
    const collections = await databases.listCollections(DB_ID);
    console.log(`\nFound ${collections.total} collections\n`);

    const analyses: CollectionAnalysis[] = [];

    // Analyze each collection
    for (const collection of collections.collections) {
        try {
            const analysis = await analyzeCollection(collection.$id, collection.name);
            analyses.push(analysis);
        } catch (e: any) {
            console.error(`❌ Failed to analyze ${collection.name}: ${e.message}`);
        }
    }

    // Check relationships
    const relationshipIssues = await checkRelationships();

    // Generate report
    console.log('\n📝 Generating report...');
    const report = await generateReport(analyses, relationshipIssues);

    // Save report
    const reportPath = path.join(process.cwd(), 'docs/DATABASE_ANALYSIS_REPORT.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n✅ Report saved to: ${reportPath}`);
    console.log('\n═══════════════════════════════════════');
    console.log('           ANALYSIS COMPLETE           ');
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
