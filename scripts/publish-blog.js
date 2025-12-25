const { Client, Users, Databases, Storage, ID, Query } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuration
const CONFIG = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1',
    projectId: 'landsalelkproject', // Hardcoded from appwrite.json to be safe
    apiKey: process.env.APPWRITE_API_KEY,
    dbId: 'landsalelkdb',
    collectionId: 'blog_posts',
    bucketId: 'listing_images', // Reuse existing bucket
    targetEmail: 'landsalelkinfo@gmail.com'
};

if (!CONFIG.apiKey) {
    console.error('Error: APPWRITE_API_KEY not found in .env.local');
    process.exit(1);
}

const client = new Client();
client
    .setEndpoint(CONFIG.endpoint)
    .setProject(CONFIG.projectId)
    .setKey(CONFIG.apiKey);

const users = new Users(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Image mapping (Artifact Path -> Slug mapping)
// Note: You need to replace these with the ACTUAL paths returned by the generation tool
// I will try to find them in the artifact directory
const IMAGE_DIR = '/home/prabhath/.gemini/antigravity/brain/85ea9037-669e-4ca7-bc26-935ef151242a';
const BLOG_DIR = path.join(__dirname, '../content/blog');

const ARTICLE_IMAGE_MAP = {
    'sinnakkara-vs-bimsaviya': 'sinnakkara_vs_bimsaviya_cover',
    'cost-of-building-2-story-house': 'construction_cost_cover',
    'best-suburbs-colombo-under-10-lakhs': 'colombo_suburbs_cover',
    'stamp-duty-legal-fees-buying-land': 'stamp_duty_fees_cover',
    'investing-horana-homagama-smart-choice': 'horana_homagama_invest_cover'
};

async function findImageFile(baseName) {
    const files = fs.readdirSync(IMAGE_DIR);
    // Find file that starts with baseName and has .png extension
    const match = files.find(f => f.startsWith(baseName) && f.endsWith('.png'));
    if (match) return path.join(IMAGE_DIR, match);
    return null;
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { data: {}, content: content };

    const frontmatterRaw = match[1];
    const body = match[2].trim();

    const data = {};
    frontmatterRaw.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join(':').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            data[key] = value;
        }
    });

    return { data, content: body };
}

async function main() {
    try {
        console.log('Starting Blog Publication...');

        // 1. Get User
        console.log(`Finding user: ${CONFIG.targetEmail}`);
        const userList = await users.list([
            Query.equal('email', CONFIG.targetEmail)
        ]);

        if (userList.total === 0) {
            throw new Error(`User ${CONFIG.targetEmail} not found!`);
        }
        const authorId = userList.users[0].$id;
        console.log(`Found User ID: ${authorId}`);

        // 2. Process Files
        const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

        for (const file of files) {
            console.log(`\nProcessing: ${file}`);
            const rawContent = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
            const { data, content } = parseFrontmatter(rawContent);

            if (!data.slug) {
                console.error('Skipping: No slug found');
                continue;
            }

            // 3. Create/Update Post
            // Check if post exists
            const existing = await databases.listDocuments(
                CONFIG.dbId,
                CONFIG.collectionId,
                [Query.equal('slug', data.slug)]
            );

            let imageId = null;

            // Only upload image if it's a NEW post or existing post has no image
            // To force update, we would need a flag, but for now let's save storage
            const needsImage = existing.total === 0 || !existing.documents[0].cover_image;

            if (needsImage) {
                const imageBaseName = ARTICLE_IMAGE_MAP[data.slug.replace('-sri-lanka', '')] || ARTICLE_IMAGE_MAP[data.slug];
                if (imageBaseName) {
                    const imagePath = await findImageFile(imageBaseName);
                    if (imagePath) {
                        console.log(`Uploading image: ${imagePath}`);
                        try {
                            const upload = await storage.createFile(
                                CONFIG.bucketId,
                                ID.unique(),
                                InputFile.fromPath(imagePath, imageBaseName + '.png')
                            );
                            imageId = upload.$id;
                            console.log(`Image uploaded: ${imageId}`);
                        } catch (err) {
                            console.error(`Failed to upload image: ${err.message}`);
                        }
                    } else {
                        console.warn(`Warning: Image not found for ${imageBaseName}`);
                    }
                }
            } else {
                console.log(`Skipping image upload for ${data.slug} (already exists)`);
            }

            const docData = {
                title: data.title,
                slug: data.slug,
                content: content,
                excerpt: data.excerpt || '',
                author_id: authorId
            };

            if (imageId) {
                docData.cover_image = imageId;
            }

            // Remove nulls suitable for Appwrite update
            Object.keys(docData).forEach(key => docData[key] === null && delete docData[key]);


            if (existing.total > 0) {
                console.log(`Updating existing post: ${data.slug}`);
                await databases.updateDocument(
                    CONFIG.dbId,
                    CONFIG.collectionId,
                    existing.documents[0].$id,
                    docData
                );
            } else {
                console.log(`Creating new post: ${data.slug}`);
                await databases.createDocument(
                    CONFIG.dbId,
                    CONFIG.collectionId,
                    ID.unique(),
                    docData
                );
            }
        }

        console.log('\nAll articles published successfully!');

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

main();
