'use server';

import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { DB_ID, COLLECTION_SAVED_SEARCHES } from '@/appwrite/config';

export async function createSavedSearch(data) {
    try {
        const { email, phone, location, max_price, land_type, frequency } = data;

        // Basic validation
        if (!email && !phone) {
            return { success: false, error: "Email or Phone is required" };
        }

        await databases.createDocument(
            DB_ID,
            COLLECTION_SAVED_SEARCHES,
            ID.unique(),
            {
                email,
                phone,
                location,
                max_price: parseFloat(max_price) || 0,
                land_type,
                frequency: frequency || 'daily',
                created_at: new Date().toISOString(),
                is_active: true
            }
        );

        return { success: true };
    } catch (error) {
        console.error('Error creating saved search:', error);
        return { success: false, error: error.message || "Failed to save search" };
    }
}
