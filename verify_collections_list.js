const fs = require('fs');
try {
    const raw = fs.readFileSync('collections_list.json', 'utf8');
    // The CLI output might contain "collections" key or be an array?
    // Usually { total: N, collections: [...] }
    const data = JSON.parse(raw);

    if (data.collections) {
        console.log(`Total Collections Found: ${data.total}`);
        const foundIds = data.collections.map(c => c.$id);

        const expected = [
            'users_extended', 'listings', 'categories', 'listing_offers', 'reviews',
            'favorites', 'saved_searches', 'notifications',
            'agents', 'agent_leads', 'training_progress', 'certificates', 'agent_subscriptions', 'open_houses', 'agent_payments',
            'transactions', 'user_wallets', 'digital_purchases',
            'countries', 'regions', 'cities', 'areas',
            'kyc_requests', 'land_offices', 'consent_logs',
            'legal_documents', 'document_purchases',
            'cms_pages', 'blog_posts', 'faqs', 'settings', 'coupons', 'audit_logs', 'email_templates', 'subscription_plans',
            'seo_meta', 'subscribers', 'messages'
        ];

        expected.forEach(id => {
            console.log(`${id}: ${foundIds.includes(id) ? 'VERIFIED' : 'MISSING'}`);
        });

    } else {
        console.log("Unexpected JSON structure:", Object.keys(data));
    }

} catch (e) {
    console.log("Error parsing JSON:", e.message);
    console.log("Raw start:", fs.readFileSync('collections_list.json', 'utf8').substring(0, 100));
}
