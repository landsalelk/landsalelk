/**
 * Setup Admins Team with Member
 * Creates the 'admins' team and adds a member automatically
 */

const { Client, Teams, Users } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val.length && !process.env[key.trim()]) {
            process.env[key.trim()] = val.join('=').trim();
        }
    });
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const teams = new Teams(client);
const users = new Users(client);

async function setupAdminsTeam() {
    console.log('\n🔐 Setting up Admins Team...\n');

    try {
        let adminTeam;

        // Check if team already exists
        try {
            adminTeam = await teams.get('admins');
            console.log(`✅ Team already exists: ${adminTeam.name}`);
        } catch (e) {
            if (e.code === 404) {
                // Create the admins team
                adminTeam = await teams.create('admins', 'Administrators');
                console.log(`✅ Created team: ${adminTeam.name}`);
            } else {
                throw e;
            }
        }

        // Get all users and add the first one (or all) as admin
        console.log('\n� Finding users to add as admin...');
        const userList = await users.list();

        if (userList.users.length === 0) {
            console.log('⚠️  No users found. Create a user account first, then run this script again.');
            return;
        }

        // Add each user to the admins team
        for (const user of userList.users) {
            try {
                // Check if user is already a member
                const memberships = await teams.listMemberships('admins');
                const alreadyMember = memberships.memberships.some(m => m.userId === user.$id);

                if (alreadyMember) {
                    console.log(`   ✓ ${user.email} - Already admin`);
                    continue;
                }

                // Add user to team
                await teams.createMembership(
                    'admins',
                    ['owner'], // roles
                    user.email,
                    user.$id,  // userId
                    undefined, // phone
                    `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '')}/auth/teams/admins/join` // url (not needed for server-side)
                );
                console.log(`   ✅ Added ${user.email} as admin`);
            } catch (e) {
                // Try alternative method - direct membership
                try {
                    await teams.createMembership(
                        'admins',
                        ['owner'],
                        user.email
                    );
                    console.log(`   ✅ Invited ${user.email} as admin`);
                } catch (e2) {
                    console.log(`   ⚠️  ${user.email}: ${e2.message?.slice(0, 50)}`);
                }
            }
        }

        console.log('\n✅ Admin team setup complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupAdminsTeam();
