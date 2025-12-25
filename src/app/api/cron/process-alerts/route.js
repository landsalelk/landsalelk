import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_SAVED_SEARCHES, COLLECTION_LISTINGS } from '@/appwrite/config';
import { Query } from 'appwrite';
import { EmailService } from '@/lib/email';

// Revalidate 0 ensures this isn't cached
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Security: In production, check for a CRON_SECRET header
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // 1. Fetch Active Saved Searches
        const searches = await databases.listDocuments(
            DB_ID,
            COLLECTION_SAVED_SEARCHES,
            [Query.equal('is_active', true)]
        );

        let emailsSent = 0;
        let processedSearches = 0;

        for (const search of searches.documents) {
            // Determine the time window for "new" listings
            // If last_notified_at exists, look for listings created AFTER that.
            // If not, look for listings created in the last 24 hours (to avoid spamming old listings on first run)

            const lastNotified = search.last_notified_at
                ? new Date(search.last_notified_at)
                : new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

            const queries = [
                Query.greaterThan('created_at', lastNotified.toISOString()), // Only new items
                Query.equal('status', 'active') // Only active listings
            ];

            // Location Filter (contains)
            if (search.location) {
                // Appwrite doesn't support 'contains' well on all string fields without full-text index
                // We'll filter in memory for better accuracy if the dataset is small, 
                // OR assume 'city' or 'location' field matches.
                // For now, let's just fetch recent listings and filter in JS to be safe and flexible
            }

            // Price Filter
            if (search.max_price && search.max_price > 0) {
                queries.push(Query.lessThanEqual('price', search.max_price));
            }

            // Land Type Filter
            if (search.land_type && search.land_type !== 'Any') {
                queries.push(Query.equal('land_type', search.land_type));
            }

            // Fetch potential matches
            // Note: Since Appwrite queries are AND only, location is tricky if it's a partial match.
            // We'll fetch mostly by Price/Type/Time and then filter Location in code.
            const listings = await databases.listDocuments(
                DB_ID,
                COLLECTION_LISTINGS,
                queries
            );

            // In-memory Location Match (Case insensitive partial match)
            const matches = listings.documents.filter(l => {
                if (!search.location) return true;
                const searchLoc = search.location.toLowerCase();
                const listingLoc = (l.city || l.location || '').toLowerCase();
                return listingLoc.includes(searchLoc);
            });

            if (matches.length > 0) {
                // Send alert for the most recent match (or summary of multiple)
                // For this MVP, we'll send one email per search run if matches found.
                const topMatch = matches[0];

                if (search.email) {
                    await EmailService.sendMatchAlert({
                        to: search.email,
                        listing: topMatch,
                        search: search
                    });
                    emailsSent++;
                }

                // Update last_notified_at
                await databases.updateDocument(
                    DB_ID,
                    COLLECTION_SAVED_SEARCHES,
                    search.$id,
                    {
                        last_notified_at: new Date().toISOString()
                    }
                );
            }

            processedSearches++;
        }

        return NextResponse.json({
            success: true,
            searches_processed: processedSearches,
            emails_sent: emailsSent
        });

    } catch (error) {
        console.error("Error processing alerts:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
