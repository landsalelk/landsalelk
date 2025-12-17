const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupTrainingCollections() {
    console.log('🚀 Setting up Training Collections...\n');

    // 1. Training Progress Collection
    try {
        await databases.createCollection(
            DB_ID,
            'training_progress',
            'Training Progress',
            ['read("any")', 'create("users")', 'update("users")']
        );
        console.log('✅ Created training_progress collection');

        // Add attributes
        await databases.createStringAttribute(DB_ID, 'training_progress', 'user_id', 255, true);
        await databases.createStringAttribute(DB_ID, 'training_progress', 'completed_modules', 5000, false, '[]');
        await databases.createStringAttribute(DB_ID, 'training_progress', 'badges', 2000, false, '[]');
        await databases.createStringAttribute(DB_ID, 'training_progress', 'quiz_attempts', 10000, false, '{}');
        await databases.createIntegerAttribute(DB_ID, 'training_progress', 'total_time_spent', false, 0, 0, 999999);
        await databases.createBooleanAttribute(DB_ID, 'training_progress', 'is_certified', false, false);
        await databases.createDatetimeAttribute(DB_ID, 'training_progress', 'certified_at', false);
        await databases.createDatetimeAttribute(DB_ID, 'training_progress', 'started_at', false);
        await databases.createDatetimeAttribute(DB_ID, 'training_progress', 'last_activity_at', false);

        console.log('   ✅ Added training_progress attributes');
    } catch (e) {
        if (e.code === 409) console.log('⏭️  training_progress collection already exists');
        else console.error('❌ training_progress error:', e.message);
    }

    // 2. Certificates Collection
    try {
        await databases.createCollection(
            DB_ID,
            'certificates',
            'Agent Certificates',
            ['read("any")', 'create("users")']
        );
        console.log('✅ Created certificates collection');

        await databases.createStringAttribute(DB_ID, 'certificates', 'user_id', 255, true);
        await databases.createStringAttribute(DB_ID, 'certificates', 'agent_id', 255, false);
        await databases.createStringAttribute(DB_ID, 'certificates', 'certificate_number', 50, true);
        await databases.createStringAttribute(DB_ID, 'certificates', 'recipient_name', 255, true);
        await databases.createStringAttribute(DB_ID, 'certificates', 'modules_completed', 1000, false);
        await databases.createStringAttribute(DB_ID, 'certificates', 'badges_earned', 1000, false);
        await databases.createIntegerAttribute(DB_ID, 'certificates', 'total_time_hours', false, 0, 0, 9999);
        await databases.createStringAttribute(DB_ID, 'certificates', 'verification_url', 500, false);
        await databases.createStringAttribute(DB_ID, 'certificates', 'pdf_file_id', 255, false);
        await databases.createDatetimeAttribute(DB_ID, 'certificates', 'issued_at', true);
        await databases.createDatetimeAttribute(DB_ID, 'certificates', 'expires_at', false);
        await databases.createBooleanAttribute(DB_ID, 'certificates', 'is_valid', false, true);

        console.log('   ✅ Added certificates attributes');
    } catch (e) {
        if (e.code === 409) console.log('⏭️  certificates collection already exists');
        else console.error('❌ certificates error:', e.message);
    }

    // 3. Add training fields to agents collection if not present
    try {
        await databases.createBooleanAttribute(DB_ID, 'agents', 'training_completed', false, false);
        await databases.createDatetimeAttribute(DB_ID, 'agents', 'training_completed_at', false);
        await databases.createStringAttribute(DB_ID, 'agents', 'certificate_id', 255, false);
        await databases.createStringAttribute(DB_ID, 'agents', 'training_progress_id', 255, false);
        console.log('✅ Added training fields to agents collection');
    } catch (e) {
        if (e.code === 409) console.log('⏭️  Training fields already exist in agents');
        else console.log('⚠️  Could not add training fields to agents:', e.message);
    }

    // Create indexes
    console.log('\n📇 Creating indexes...');
    try {
        await databases.createIndex(DB_ID, 'training_progress', 'user_id_idx', 'key', ['user_id']);
        await databases.createIndex(DB_ID, 'certificates', 'user_id_idx', 'key', ['user_id']);
        await databases.createIndex(DB_ID, 'certificates', 'cert_number_idx', 'unique', ['certificate_number']);
        console.log('✅ Indexes created');
    } catch (e) {
        console.log('⚠️  Index creation:', e.message);
    }

    console.log('\n✅ Training collections setup complete!');
}

setupTrainingCollections().catch(console.error);
