/**
 * Appwrite PDF Generator Setup Script
 * Creates necessary collections and storage buckets for PDF generation
 */

import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.DATABASE_ID || 'osclass_landsale_db';
const PDF_BUCKET_ID = 'generated_pdfs';
const PDF_DOCUMENTS_COLLECTION_ID = 'pdf_documents';

/**
 * Setup PDF generation infrastructure
 */
async function setupPDFGenerator() {
    console.log('🚀 Setting up PDF Generator for Appwrite...');

    try {
        // 1. Create PDF storage bucket
        await createPDFBucket();
        
        // 2. Create PDF documents collection
        await createPDFDocumentsCollection();
        
        console.log('✅ PDF Generator setup completed successfully!');
        console.log('📁 Storage Bucket:', PDF_BUCKET_ID);
        console.log('📄 Documents Collection:', PDF_DOCUMENTS_COLLECTION_ID);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

/**
 * Create PDF storage bucket
 */
async function createPDFBucket() {
    try {
        console.log('📁 Creating PDF storage bucket...');
        
        await storage.createBucket(
            PDF_BUCKET_ID,
            'Generated PDFs',
            undefined, // permissions (bucket-level)
            true, // file security
            undefined, // enabled
            undefined, // maximum file size
            ['application/pdf'], // allowed file extensions
            true // compression
        );
        
        console.log('✅ PDF bucket created successfully');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  PDF bucket already exists');
        } else {
            throw error;
        }
    }
}

/**
 * Create PDF documents collection
 */
async function createPDFDocumentsCollection() {
    try {
        console.log('📄 Creating PDF documents collection...');
        
        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            PDF_DOCUMENTS_COLLECTION_ID,
            'PDF Documents',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ],
            true // document security
        );
        
        // Create attributes
        const attributes = [
            {
                key: 'file_id',
                type: 'string',
                size: 36,
                required: true,
                array: false
            },
            {
                key: 'filename',
                type: 'string',
                size: 255,
                required: true,
                array: false
            },
            {
                key: 'format',
                type: 'enum',
                elements: ['html', 'markdown', 'json', 'template'],
                required: true,
                array: false
            },
            {
                key: 'size',
                type: 'integer',
                required: true,
                array: false,
                min: 0,
                max: 52428800 // 50MB in bytes
            },
            {
                key: 'metadata',
                type: 'string',
                size: 65535, // 64KB max
                required: false,
                array: false
            },
            {
                key: 'status',
                type: 'enum',
                elements: ['pending', 'processing', 'completed', 'failed'],
                required: true,
                array: false,
                default: 'pending'
            },
            {
                key: 'generated_at',
                type: 'datetime',
                required: true,
                array: false
            },
            {
                key: 'error_message',
                type: 'string',
                size: 1000,
                required: false,
                array: false
            },
            {
                key: 'processing_time',
                type: 'integer',
                required: false,
                array: false,
                min: 0
            }
        ];
        
        // Create attributes sequentially
        for (const attr of attributes) {
            try {
                switch (attr.type) {
                    case 'string':
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            PDF_DOCUMENTS_COLLECTION_ID,
                            attr.key,
                            attr.size,
                            attr.required,
                            attr.default,
                            attr.array
                        );
                        break;
                    case 'integer':
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            PDF_DOCUMENTS_COLLECTION_ID,
                            attr.key,
                            attr.required,
                            attr.min,
                            attr.max,
                            attr.default,
                            attr.array
                        );
                        break;
                    case 'enum':
                        await databases.createEnumAttribute(
                            DATABASE_ID,
                            PDF_DOCUMENTS_COLLECTION_ID,
                            attr.key,
                            attr.elements,
                            attr.required,
                            attr.default,
                            attr.array
                        );
                        break;
                    case 'datetime':
                        await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            PDF_DOCUMENTS_COLLECTION_ID,
                            attr.key,
                            attr.required,
                            attr.default,
                            attr.array
                        );
                        break;
                }
                console.log(`  ✓ Created attribute: ${attr.key}`);
            } catch (attrError) {
                if (attrError.code === 409) {
                    console.log(`  ℹ️  Attribute ${attr.key} already exists`);
                } else {
                    console.error(`  ❌ Failed to create attribute ${attr.key}:`, attrError.message);
                }
            }
        }
        
        // Create indexes
        const indexes = [
            {
                key: 'idx_file_id',
                type: 'key',
                attributes: ['file_id'],
                orders: ['ASC']
            },
            {
                key: 'idx_status',
                type: 'key',
                attributes: ['status'],
                orders: ['ASC']
            },
            {
                key: 'idx_generated_at',
                type: 'key',
                attributes: ['generated_at'],
                orders: ['DESC']
            },
            {
                key: 'idx_format',
                type: 'key',
                attributes: ['format'],
                orders: ['ASC']
            }
        ];
        
        for (const index of indexes) {
            try {
                await databases.createIndex(
                    DATABASE_ID,
                    PDF_DOCUMENTS_COLLECTION_ID,
                    index.key,
                    index.type,
                    index.attributes,
                    index.orders
                );
                console.log(`  ✓ Created index: ${index.key}`);
            } catch (indexError) {
                if (indexError.code === 409) {
                    console.log(`  ℹ️  Index ${index.key} already exists`);
                } else {
                    console.error(`  ❌ Failed to create index ${index.key}:`, indexError.message);
                }
            }
        }
        
        console.log('✅ PDF documents collection created successfully');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  PDF documents collection already exists');
        } else {
            throw error;
        }
    }
}

// Run setup
setupPDFGenerator().catch(console.error);