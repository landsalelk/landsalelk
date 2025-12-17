import { Client, Databases } from 'node-appwrite';
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

async function seedFAQs() {
    console.log('--- Seeding FAQs ---');

    const faqs = [
        { id: 'faq-1', question: 'How do I post a property listing?', answer: 'Click "Post Ad" button, select your property category, fill in the details, upload photos, and submit. Your listing will be reviewed and published within 24 hours.', category: 'Posting', sort_order: 1 },
        { id: 'faq-2', question: 'Is it free to list my property?', answer: 'Yes! Basic listings are completely free. We offer premium packages for featured placement and additional visibility.', category: 'Pricing', sort_order: 2 },
        { id: 'faq-3', question: 'How can I contact a property owner?', answer: 'Each listing has a contact button. You can call, WhatsApp, or send a message directly through our platform.', category: 'Contact', sort_order: 3 },
        { id: 'faq-4', question: 'How do I verify my property listing?', answer: 'You can request verification by uploading property documents. Our team will verify within 48 hours. Verified listings get a trust badge.', category: 'Verification', sort_order: 4 },
        { id: 'faq-5', question: 'Can I edit my listing after posting?', answer: 'Yes, you can edit your listing anytime from your dashboard. Changes will be reflected immediately.', category: 'Posting', sort_order: 5 },
        { id: 'faq-6', question: 'How long does a listing stay active?', answer: 'Standard listings remain active for 30 days. You can renew them for free from your dashboard.', category: 'Posting', sort_order: 6 },
        { id: 'faq-7', question: 'What payment methods are accepted?', answer: 'We accept all major credit/debit cards, bank transfers, and mobile payments including FriMi, iPay, and eZ Cash.', category: 'Pricing', sort_order: 7 },
        { id: 'faq-8', question: 'How do I report a suspicious listing?', answer: 'Click the "Report" button on any listing. Our moderation team reviews all reports within 24 hours.', category: 'Safety', sort_order: 8 }
    ];

    let created = 0;
    for (const faq of faqs) {
        try {
            await databases.createDocument(DB_ID, 'faqs', faq.id, {
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                sort_order: faq.sort_order,
                is_active: true
            });
            created++;
        } catch (e: any) {
            if (e.code === 409) {
                await databases.updateDocument(DB_ID, 'faqs', faq.id, {
                    question: faq.question,
                    answer: faq.answer,
                    category: faq.category,
                    sort_order: faq.sort_order,
                    is_active: true
                });
            }
        }
    }
    console.log(`✅ FAQs: ${created} created`);
}

async function seedCMSPages() {
    console.log('\n--- Seeding CMS Pages ---');

    const pages = [
        {
            id: 'about',
            title: 'About Us',
            slug: 'about',
            content: `# About LandSale.lk

LandSale.lk is Sri Lanka's premier property marketplace, connecting buyers, sellers, and renters across the island.

## Our Mission
To make property transactions simple, transparent, and accessible for every Sri Lankan.

## What We Offer
- **Free Listings**: Post your property for free
- **Verified Properties**: Trust-verified listings
- **Island-wide Coverage**: Properties in all 25 districts
- **AI-Powered Search**: Find your perfect property instantly

## Contact Us
- Email: info@landsale.lk
- Phone: +94 11 234 5678
- Address: Colombo, Sri Lanka`,
            meta_title: 'About Us - LandSale.lk',
            meta_description: 'Learn about LandSale.lk, Sri Lanka\'s premier property marketplace for buying, selling, and renting properties.'
        },
        {
            id: 'terms',
            title: 'Terms of Service',
            slug: 'terms',
            content: `# Terms of Service

Last updated: December 2025

## 1. Acceptance of Terms
By accessing LandSale.lk, you agree to these terms.

## 2. User Accounts
- You must provide accurate information
- You are responsible for your account security
- One account per person

## 3. Listing Rules
- Only post properties you own or are authorized to sell/rent
- Provide accurate property information
- No duplicate listings

## 4. Prohibited Content
- False or misleading information
- Illegal properties
- Spam or scam listings

## 5. Payments
- All payments are processed securely
- Refund policy applies as per our guidelines

## 6. Liability
LandSale.lk is a marketplace platform. We do not guarantee property transactions.`,
            meta_title: 'Terms of Service - LandSale.lk',
            meta_description: 'Read the terms and conditions for using LandSale.lk property marketplace.'
        },
        {
            id: 'privacy',
            title: 'Privacy Policy',
            slug: 'privacy',
            content: `# Privacy Policy

Last updated: December 2025

## Information We Collect
- Account information (name, email, phone)
- Property listing details
- Usage data and analytics

## How We Use Your Data
- To provide our services
- To improve user experience
- To send relevant notifications

## Data Security
We use industry-standard encryption to protect your data.

## Your Rights
- Access your data
- Request deletion
- Opt-out of marketing

## Contact
For privacy concerns: privacy@landsale.lk`,
            meta_title: 'Privacy Policy - LandSale.lk',
            meta_description: 'Learn how LandSale.lk collects, uses, and protects your personal information.'
        },
        {
            id: 'contact',
            title: 'Contact Us',
            slug: 'contact',
            content: `# Contact Us

We're here to help!

## Customer Support
- **Email**: support@landsale.lk
- **Phone**: +94 11 234 5678
- **WhatsApp**: +94 77 123 4567
- **Hours**: Mon-Fri 9AM-6PM, Sat 9AM-1PM

## Office Address
LandSale.lk
123 Property Lane
Colombo 03, Sri Lanka

## Business Inquiries
For partnerships and advertising: business@landsale.lk

## Report Issues
Found a problem? Email: report@landsale.lk`,
            meta_title: 'Contact Us - LandSale.lk',
            meta_description: 'Get in touch with LandSale.lk customer support for any questions about property listings.'
        }
    ];

    let created = 0;
    for (const page of pages) {
        try {
            await databases.createDocument(DB_ID, 'cms_pages', page.id, {
                title: page.title,
                slug: page.slug,
                content: page.content,
                meta_title: page.meta_title,
                meta_description: page.meta_description,
                is_active: true
            });
            created++;
        } catch (e: any) {
            if (e.code === 409) {
                await databases.updateDocument(DB_ID, 'cms_pages', page.id, {
                    title: page.title,
                    slug: page.slug,
                    content: page.content,
                    meta_title: page.meta_title,
                    meta_description: page.meta_description,
                    is_active: true
                });
            }
        }
    }
    console.log(`✅ CMS Pages: ${created} created`);
}

async function seedSettings() {
    console.log('\n--- Seeding Default Settings ---');

    const settings = [
        { key: 'site_name', value: 'LandSale.lk', description: 'Website name', type: 'string' },
        { key: 'site_tagline', value: 'Sri Lanka\'s Premier Property Marketplace', description: 'Website tagline', type: 'string' },
        { key: 'contact_email', value: 'info@landsale.lk', description: 'Contact email', type: 'string' },
        { key: 'contact_phone', value: '+94 11 234 5678', description: 'Contact phone', type: 'string' },
        { key: 'currency_default', value: 'LKR', description: 'Default currency', type: 'string' },
        { key: 'listing_duration_days', value: '30', description: 'Default listing duration', type: 'integer' },
        { key: 'max_images_per_listing', value: '10', description: 'Maximum images per listing', type: 'integer' },
        { key: 'enable_premium_listings', value: 'true', description: 'Enable premium listings', type: 'boolean' },
        { key: 'enable_verification', value: 'true', description: 'Enable property verification', type: 'boolean' },
        { key: 'enable_ai_chat', value: 'true', description: 'Enable AI chat assistant', type: 'boolean' }
    ];

    let created = 0;
    for (const setting of settings) {
        try {
            await databases.createDocument(DB_ID, 'settings', setting.key, {
                key: setting.key,
                value: setting.value,
                description: setting.description,
                type: setting.type
            });
            created++;
        } catch (e: any) {
            if (e.code === 409) {
                await databases.updateDocument(DB_ID, 'settings', setting.key, {
                    value: setting.value,
                    description: setting.description,
                    type: setting.type
                });
            }
        }
    }
    console.log(`✅ Settings: ${created} created`);
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   SEED CONTENT: FAQs, CMS, Settings   ║');
    console.log('╚═══════════════════════════════════════╝\n');

    await seedFAQs();
    await seedCMSPages();
    await seedSettings();

    console.log('\n✓ Content seeding complete!');
}

main().catch(console.error);
