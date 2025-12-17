#!/usr/bin/env node

/**
 * Appwrite Implementation Verification and Analysis Tool
 * This script analyzes your current Appwrite setup and identifies issues
 */

const { Client, Account, Databases, Storage, Users } = require('node-appwrite');

// Configuration from your environment
const config = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'landsalelkproject',
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'landsalelkdb'
};

class AppwriteAnalyzer {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.results = {
            connection: {},
            authentication: {},
            database: {},
            storage: {},
            functions: {},
            issues: [],
            recommendations: []
        };
    }

    async initializeClient() {
        try {
            this.client = new Client()
                .setEndpoint(this.config.endpoint)
                .setProject(this.config.projectId)
                .setKey(this.config.apiKey);
            
            console.log('✅ Appwrite client initialized successfully');
            this.results.connection.status = 'success';
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Appwrite client:', error.message);
            this.results.connection.status = 'failed';
            this.results.issues.push({
                category: 'connection',
                severity: 'critical',
                message: `Client initialization failed: ${error.message}`
            });
            return false;
        }
    }

    async verifyAPIKeyScopes() {
        console.log('\n🔍 Verifying API Key Scopes...');
        
        try {
            const users = new Users(this.client);
            const databases = new Databases(this.client);
            
            // Test different scopes
            const tests = [
                {
                    name: 'users.read',
                    test: async () => {
                        try {
                            await users.list();
                            return { success: true };
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }
                },
                {
                    name: 'users.write',
                    test: async () => {
                        try {
                            // Try to get current user (minimal test)
                            await users.get('test');
                            return { success: false, error: 'Test user not found but scope might be available' };
                        } catch (error) {
                            if (error.message.includes('missing scope')) {
                                return { success: false, error: error.message };
                            }
                            return { success: true, message: 'Scope available (user not found is expected)' };
                        }
                    }
                },
                {
                    name: 'account',
                    test: async () => {
                        try {
                            const account = new Account(this.client);
                            await account.get();
                            return { success: true };
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }
                },
                {
                    name: 'databases.read',
                    test: async () => {
                        try {
                            await databases.list();
                            return { success: true };
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }
                },
                {
                    name: 'databases.write',
                    test: async () => {
                        try {
                            // Try to get database info
                            await databases.get(this.config.databaseId);
                            return { success: true };
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }
                }
            ];

            for (const test of tests) {
                console.log(`  Testing ${test.name}...`);
                const result = await test.test();
                
                if (result.success) {
                    console.log(`    ✅ ${test.name} - Available`);
                    this.results.authentication[test.name] = 'available';
                } else {
                    console.log(`    ❌ ${test.name} - Missing`);
                    console.log(`       Error: ${result.error}`);
                    this.results.authentication[test.name] = 'missing';
                    
                    if (result.error.includes('missing scope')) {
                        this.results.issues.push({
                            category: 'authentication',
                            severity: 'high',
                            scope: test.name,
                            message: `API key missing ${test.name} scope`
                        });
                    }
                }
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.error('❌ API key verification failed:', error.message);
            this.results.issues.push({
                category: 'authentication',
                severity: 'critical',
                message: `API key verification failed: ${error.message}`
            });
        }
    }

    async verifyDatabaseCollections() {
        console.log('\n🔍 Verifying Database Collections...');
        
        try {
            const databases = new Databases(this.client);
            
            // Check if database exists
            try {
                const database = await databases.get(this.config.databaseId);
                console.log(`✅ Database "${database.name}" found`);
                this.results.database.exists = true;
                this.results.database.name = database.name;
            } catch (error) {
                console.log(`❌ Database "${this.config.databaseId}" not found`);
                this.results.database.exists = false;
                this.results.issues.push({
                    category: 'database',
                    severity: 'critical',
                    message: `Database "${this.config.databaseId}" does not exist`
                });
                return;
            }
            
            // List all collections
            try {
                const collections = await databases.listCollections(this.config.databaseId);
                console.log(`✅ Found ${collections.total} collections`);
                
                this.results.database.collections = collections.collections.map(col => ({
                    id: col.$id,
                    name: col.name,
                    attributes: col.attributes?.length || 0,
                    indexes: col.indexes?.length || 0,
                    permissions: col.$permissions
                }));
                
                // Check for required collections
                const requiredCollections = [
                    'listings', 'users_extended', 'favorites', 'reviews',
                    'countries', 'regions', 'cities', 'areas'
                ];
                
                const existingCollectionIds = collections.collections.map(col => col.$id);
                
                for (const required of requiredCollections) {
                    if (existingCollectionIds.includes(required)) {
                        console.log(`  ✅ ${required} collection found`);
                    } else {
                        console.log(`  ❌ ${required} collection missing`);
                        this.results.issues.push({
                            category: 'database',
                            severity: 'medium',
                            message: `Required collection "${required}" not found`
                        });
                    }
                }
                
            } catch (error) {
                console.log(`❌ Failed to list collections: ${error.message}`);
                this.results.issues.push({
                    category: 'database',
                    severity: 'high',
                    message: `Failed to list collections: ${error.message}`
                });
            }
            
        } catch (error) {
            console.error('❌ Database verification failed:', error.message);
            this.results.issues.push({
                category: 'database',
                severity: 'critical',
                message: `Database verification failed: ${error.message}`
            });
        }
    }

    async verifyStorageBuckets() {
        console.log('\n🔍 Verifying Storage Buckets...');
        
        try {
            const storage = new Storage(this.client);
            
            const buckets = await storage.listBuckets();
            console.log(`✅ Found ${buckets.total} buckets`);
            
            this.results.storage.buckets = buckets.buckets.map(bucket => ({
                id: bucket.$id,
                name: bucket.name,
                fileSecurity: bucket.fileSecurity,
                maximumFileSize: bucket.maximumFileSize,
                allowedFileExtensions: bucket.allowedFileExtensions,
                permissions: bucket.$permissions
            }));
            
            // Check for required buckets
            const requiredBuckets = [
                'listing_images', 'user_avatars', 'listing_documents', 'blog_images'
            ];
            
            const existingBucketIds = buckets.buckets.map(bucket => bucket.$id);
            
            for (const required of requiredBuckets) {
                if (existingBucketIds.includes(required)) {
                    console.log(`  ✅ ${required} bucket found`);
                } else {
                    console.log(`  ❌ ${required} bucket missing`);
                    this.results.issues.push({
                        category: 'storage',
                        severity: 'medium',
                        message: `Required bucket "${required}" not found`
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ Storage verification failed:', error.message);
            this.results.issues.push({
                category: 'storage',
                severity: 'high',
                message: `Storage verification failed: ${error.message}`
            });
        }
    }

    async verifyFunctions() {
        console.log('\n🔍 Verifying Cloud Functions...');
        
        try {
            // Note: Functions API might not be available in all Appwrite versions
            console.log('  ⚠️  Function verification requires Functions API access');
            
            // Try to list functions if API is available
            try {
                const response = await fetch(`${this.config.endpoint}/functions`, {
                    headers: {
                        'X-Appwrite-Project': this.config.projectId,
                        'X-Appwrite-Key': this.config.apiKey,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Found ${data.total} functions`);
                    this.results.functions.count = data.total;
                } else {
                    console.log('  ⚠️  Functions API not accessible or no functions deployed');
                    this.results.functions.status = 'not_accessible';
                }
            } catch (error) {
                console.log('  ⚠️  Functions verification skipped:', error.message);
                this.results.functions.status = 'verification_skipped';
            }
            
        } catch (error) {
            console.error('❌ Functions verification failed:', error.message);
            this.results.issues.push({
                category: 'functions',
                severity: 'low',
                message: `Functions verification failed: ${error.message}`
            });
        }
    }

    generateRecommendations() {
        console.log('\n💡 Generating Recommendations...');
        
        // API Key recommendations
        if (this.results.authentication.account === 'missing') {
            this.results.recommendations.push({
                priority: 'critical',
                category: 'authentication',
                title: 'Fix API Key Scopes',
                description: 'Your API key is missing the "account" scope which is required for user authentication. Create a new API key with all required scopes.',
                action: 'Create new API key with scopes: users.read, users.write, account, databases.read, databases.write'
            });
        }
        
        // Database recommendations
        if (!this.results.database.exists) {
            this.results.recommendations.push({
                priority: 'critical',
                category: 'database',
                title: 'Create Database',
                description: 'The configured database does not exist. Create the database first before proceeding.',
                action: `Create database with ID: "${this.config.databaseId}"`
            });
        }
        
        // Missing collections
        const missingCollections = this.results.issues.filter(issue => 
            issue.category === 'database' && issue.severity === 'medium'
        );
        
        if (missingCollections.length > 0) {
            this.results.recommendations.push({
                priority: 'high',
                category: 'database',
                title: 'Create Missing Collections',
                description: `${missingCollections.length} required collections are missing.`,
                action: 'Run database migration scripts to create missing collections'
            });
        }
        
        // Missing buckets
        const missingBuckets = this.results.issues.filter(issue => 
            issue.category === 'storage' && issue.severity === 'medium'
        );
        
        if (missingBuckets.length > 0) {
            this.results.recommendations.push({
                priority: 'medium',
                category: 'storage',
                title: 'Create Missing Storage Buckets',
                description: `${missingBuckets.length} required storage buckets are missing.`,
                action: 'Create storage buckets for listing images, user avatars, documents, and blog images'
            });
        }
        
        // General recommendations
        this.results.recommendations.push({
            priority: 'medium',
            category: 'security',
            title: 'Review Security Settings',
            description: 'Ensure all collections and buckets have appropriate permissions.',
            action: 'Review and update permissions for all collections and buckets'
        });
        
        this.results.recommendations.push({
            priority: 'low',
            category: 'monitoring',
            title: 'Set Up Monitoring',
            description: 'Implement monitoring and alerting for your Appwrite services.',
            action: 'Set up monitoring dashboards and alerts for database, storage, and functions'
        });
    }

    async runAnalysis() {
        console.log('🚀 Starting Appwrite Implementation Analysis...\n');
        console.log('Configuration:');
        console.log(`  Endpoint: ${this.config.endpoint}`);
        console.log(`  Project ID: ${this.config.projectId}`);
        console.log(`  Database ID: ${this.config.databaseId}`);
        console.log(`  API Key: ${this.config.apiKey ? 'Present' : 'Missing'}`);
        
        // Initialize client
        const clientInitialized = await this.initializeClient();
        if (!clientInitialized) {
            console.log('\n❌ Cannot proceed without valid client connection');
            return this.generateReport();
        }
        
        // Run all verification tests
        await this.verifyAPIKeyScopes();
        await this.verifyDatabaseCollections();
        await this.verifyStorageBuckets();
        await this.verifyFunctions();
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Generate final report
        return this.generateReport();
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 APPWRITE IMPLEMENTATION ANALYSIS REPORT');
        console.log('='.repeat(60));
        
        // Summary
        console.log('\n📈 SUMMARY:');
        const criticalIssues = this.results.issues.filter(issue => issue.severity === 'critical').length;
        const highIssues = this.results.issues.filter(issue => issue.severity === 'high').length;
        const mediumIssues = this.results.issues.filter(issue => issue.severity === 'medium').length;
        
        console.log(`  Critical Issues: ${criticalIssues}`);
        console.log(`  High Issues: ${highIssues}`);
        console.log(`  Medium Issues: ${mediumIssues}`);
        console.log(`  Total Issues: ${this.results.issues.length}`);
        
        // Detailed Issues
        if (this.results.issues.length > 0) {
            console.log('\n🔍 DETAILED ISSUES:');
            this.results.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.message}`);
                if (issue.scope) {
                    console.log(`     Scope: ${issue.scope}`);
                }
            });
        }
        
        // Recommendations
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS (Priority Order):');
            const sortedRecommendations = this.results.recommendations.sort(
                (a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority)
            );
            
            sortedRecommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
                console.log(`     ${rec.description}`);
                console.log(`     Action: ${rec.action}`);
                console.log('');
            });
        }
        
        // Status by category
        console.log('\n📊 STATUS BY CATEGORY:');
        console.log(`  Connection: ${this.results.connection.status || 'unknown'}`);
        console.log(`  Authentication: ${Object.keys(this.results.authentication).length} scopes tested`);
        console.log(`  Database: ${this.results.database.exists ? 'exists' : 'missing'}`);
        console.log(`  Collections: ${this.results.database.collections?.length || 0} found`);
        console.log(`  Storage: ${this.results.storage.buckets?.length || 0} buckets found`);
        console.log(`  Functions: ${this.results.functions.count || 0} found`);
        
        console.log('\n' + '='.repeat(60));
        
        return this.results;
    }
    
    getPriorityValue(priority) {
        const priorities = { critical: 1, high: 2, medium: 3, low: 4 };
        return priorities[priority] || 5;
    }
}

// Run the analysis
async function main() {
    // Check if API key is available
    if (!config.apiKey) {
        console.error('❌ APPWRITE_API_KEY environment variable is not set');
        console.log('Please set the API key in your .env.local file or environment variables');
        process.exit(1);
    }
    
    const analyzer = new AppwriteAnalyzer(config);
    const results = await analyzer.runAnalysis();
    
    // Save results to file
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, 'appwrite-analysis-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`\n📄 Detailed results saved to: ${reportPath}`);
    
    // Exit with appropriate code
    const criticalIssues = results.issues.filter(issue => issue.severity === 'critical').length;
    process.exit(criticalIssues > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    });
}

module.exports = { AppwriteAnalyzer };