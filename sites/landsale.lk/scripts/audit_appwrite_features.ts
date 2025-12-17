import { Client, Databases, Storage, Functions, Users, Teams } from 'node-appwrite';
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
const storage = new Storage(client);
const functions = new Functions(client);
const users = new Users(client);
const teams = new Teams(client);

interface AuditResult {
    category: string;
    feature: string;
    status: 'USED' | 'NOT_USED' | 'PARTIAL' | 'ERROR';
    details: string;
    recommendation?: string;
}

const results: AuditResult[] = [];

function addResult(category: string, feature: string, status: AuditResult['status'], details: string, recommendation?: string) {
    results.push({ category, feature, status, details, recommendation });
}

async function auditDatabase() {
    console.log('\n📊 AUDITING DATABASE...\n');

    try {
        // List all databases
        const dbs = await databases.list();
        addResult('Database', 'Databases', 'USED', `${dbs.total} database(s) found`);

        // Check collections
        const collections = await databases.listCollections(DB_ID);
        addResult('Database', 'Collections', 'USED', `${collections.total} collections in ${DB_ID}`);

        // Check indexes for each collection
        let collectionsWithIndexes = 0;
        let collectionsWithoutIndexes = 0;
        let totalIndexes = 0;

        for (const col of collections.collections) {
            try {
                const indexes = await databases.listIndexes(DB_ID, col.$id);
                if (indexes.total > 0) {
                    collectionsWithIndexes++;
                    totalIndexes += indexes.total;
                } else {
                    collectionsWithoutIndexes++;
                }
            } catch (e) {
                // Skip if can't list indexes
            }
        }

        if (collectionsWithoutIndexes > collectionsWithIndexes) {
            addResult('Database', 'Indexes', 'PARTIAL',
                `${totalIndexes} indexes across ${collectionsWithIndexes} collections`,
                `⚠️ ${collectionsWithoutIndexes} collections have NO indexes. Add indexes for frequently queried fields like 'slug', 'status', 'category_id'`
            );
        } else if (totalIndexes === 0) {
            addResult('Database', 'Indexes', 'NOT_USED',
                'No indexes found',
                '🔴 CRITICAL: Create indexes for search performance. Index: listings.slug, listings.status, listings.category_id, cities.region_id'
            );
        } else {
            addResult('Database', 'Indexes', 'USED', `${totalIndexes} indexes found`);
        }

        // Check document permissions
        let hasPermissions = false;
        for (const col of collections.collections.slice(0, 3)) {
            try {
                const docs = await databases.listDocuments(DB_ID, col.$id, []);
                if (docs.documents.length > 0 && docs.documents[0].$permissions.length > 0) {
                    hasPermissions = true;
                }
            } catch (e) { }
        }

        addResult('Database', 'Document Permissions', hasPermissions ? 'USED' : 'NOT_USED',
            hasPermissions ? 'Document-level permissions configured' : 'No document-level permissions',
            !hasPermissions ? '⚠️ Consider adding permissions for user-owned documents (listings, favorites)' : undefined
        );

        // Check relationships
        addResult('Database', 'Relationships', 'PARTIAL',
            'Using string IDs for relationships (regions→cities→areas)',
            '💡 Consider using Appwrite native relationships for automatic cascade and integrity'
        );

    } catch (e: any) {
        addResult('Database', 'General', 'ERROR', e.message);
    }
}

async function auditStorage() {
    console.log('📁 AUDITING STORAGE...\n');

    try {
        const buckets = await storage.listBuckets();

        if (buckets.total === 0) {
            addResult('Storage', 'Buckets', 'NOT_USED',
                'No storage buckets found',
                '🔴 Create buckets for: property_images, user_avatars, documents'
            );
        } else {
            addResult('Storage', 'Buckets', 'USED', `${buckets.total} bucket(s) found`);

            for (const bucket of buckets.buckets) {
                const files = await storage.listFiles(bucket.$id);
                console.log(`  - ${bucket.name}: ${files.total} files`);

                // Check bucket settings
                if (!bucket.encryption) {
                    addResult('Storage', `Bucket: ${bucket.name}`, 'PARTIAL',
                        'Encryption disabled',
                        '💡 Enable encryption for sensitive files'
                    );
                }

                if (!bucket.antivirus) {
                    addResult('Storage', `Bucket: ${bucket.name}`, 'PARTIAL',
                        'Antivirus scanning disabled',
                        '💡 Enable antivirus for uploaded files'
                    );
                }
            }
        }
    } catch (e: any) {
        addResult('Storage', 'General', 'ERROR', e.message);
    }
}

async function auditFunctions() {
    console.log('⚡ AUDITING FUNCTIONS...\n');

    try {
        const funcs = await functions.list();

        if (funcs.total === 0) {
            addResult('Functions', 'Cloud Functions', 'NOT_USED',
                'No cloud functions deployed',
                '💡 Consider functions for: email notifications, image processing, scheduled tasks, webhooks'
            );
        } else {
            addResult('Functions', 'Cloud Functions', 'USED', `${funcs.total} function(s) deployed`);

            for (const func of funcs.functions) {
                // Check if function has deployments
                const deployments = await functions.listDeployments(func.$id);
                const activeDeployment = deployments.deployments.find((d: any) => d.status === 'ready');

                if (!activeDeployment) {
                    addResult('Functions', func.name, 'PARTIAL',
                        'No active deployment',
                        '⚠️ Deploy the function to make it active'
                    );
                } else {
                    console.log(`  - ${func.name}: Active`);
                }
            }
        }
    } catch (e: any) {
        addResult('Functions', 'General', 'ERROR', e.message);
    }
}

async function auditAuth() {
    console.log('🔐 AUDITING AUTHENTICATION...\n');

    try {
        // Check users
        const usersList = await users.list();
        addResult('Auth', 'Users', 'USED', `${usersList.total} user(s) registered`);

        // Check teams
        const teamsList = await teams.list();
        if (teamsList.total === 0) {
            addResult('Auth', 'Teams', 'NOT_USED',
                'No teams configured',
                '💡 Use teams for: agents group, admin team, premium users'
            );
        } else {
            addResult('Auth', 'Teams', 'USED', `${teamsList.total} team(s) configured`);
        }

    } catch (e: any) {
        addResult('Auth', 'General', 'ERROR', e.message);
    }
}

async function checkMissingFeatures() {
    console.log('🔍 CHECKING MISSING APPWRITE FEATURES...\n');

    // Features we should be using
    const recommendations = [
        {
            feature: 'Realtime Subscriptions',
            description: 'Live updates for listings, notifications',
            status: 'Check if client uses realtime',
            recommendation: '💡 Use for: new listing alerts, bid updates, chat messages'
        },
        {
            feature: 'OAuth Providers',
            description: 'Social login (Google, Facebook)',
            status: 'Needs console check',
            recommendation: '💡 Enable Google login for easier signup'
        },
        {
            feature: 'Webhooks',
            description: 'Event-driven integrations',
            status: 'Check console',
            recommendation: '💡 Use for: payment confirmations, email triggers'
        },
        {
            feature: 'API Rate Limiting',
            description: 'Prevent abuse',
            status: 'Default enabled',
            recommendation: '✅ Already active by default'
        },
        {
            feature: 'Backup & Recovery',
            description: 'Data protection',
            status: 'Console setting',
            recommendation: '⚠️ Enable automatic backups in Appwrite console'
        }
    ];

    for (const rec of recommendations) {
        addResult('Features', rec.feature, 'PARTIAL', rec.description, rec.recommendation);
    }
}

function generateReport() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║            APPWRITE FEATURES AUDIT REPORT                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Summary
    const used = results.filter(r => r.status === 'USED').length;
    const partial = results.filter(r => r.status === 'PARTIAL').length;
    const notUsed = results.filter(r => r.status === 'NOT_USED').length;
    const errors = results.filter(r => r.status === 'ERROR').length;

    console.log('📊 SUMMARY');
    console.log('─'.repeat(60));
    console.log(`✅ FULLY USED:     ${used}`);
    console.log(`⚠️  PARTIAL/CHECK:  ${partial}`);
    console.log(`❌ NOT USED:       ${notUsed}`);
    console.log(`🔴 ERRORS:         ${errors}`);
    console.log(`\nTotal Score: ${Math.round((used / (used + partial + notUsed)) * 100)}%\n`);

    // Group by category
    const categories = [...new Set(results.map(r => r.category))];

    for (const category of categories) {
        console.log(`\n📁 ${category.toUpperCase()}`);
        console.log('─'.repeat(60));

        const categoryResults = results.filter(r => r.category === category);

        for (const result of categoryResults) {
            const icon = result.status === 'USED' ? '✅' :
                result.status === 'PARTIAL' ? '⚠️' :
                    result.status === 'NOT_USED' ? '❌' : '🔴';

            console.log(`${icon} ${result.feature}: ${result.details}`);
            if (result.recommendation) {
                console.log(`   ${result.recommendation}`);
            }
        }
    }

    // Top Recommendations
    console.log('\n');
    console.log('🎯 TOP PRIORITY RECOMMENDATIONS');
    console.log('═'.repeat(60));

    const criticalRecs = results.filter(r => r.recommendation?.includes('🔴') || r.recommendation?.includes('CRITICAL'));
    const warningRecs = results.filter(r => r.recommendation?.includes('⚠️') && !criticalRecs.includes(r));

    if (criticalRecs.length > 0) {
        console.log('\n🔴 CRITICAL:');
        for (const rec of criticalRecs) {
            console.log(`   - ${rec.feature}: ${rec.recommendation}`);
        }
    }

    if (warningRecs.length > 0) {
        console.log('\n⚠️ SHOULD FIX:');
        for (const rec of warningRecs.slice(0, 5)) {
            console.log(`   - ${rec.feature}: ${rec.recommendation}`);
        }
    }

    console.log('\n');
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   APPWRITE FEATURES AUDIT             ║');
    console.log('╚═══════════════════════════════════════╝');

    await auditDatabase();
    await auditStorage();
    await auditFunctions();
    await auditAuth();
    await checkMissingFeatures();

    generateReport();
}

main().catch(console.error);
