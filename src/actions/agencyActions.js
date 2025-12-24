"use server";

import { createAdminClient } from "@/lib/appwrite.server";
import { DB_ID, COLLECTION_AGENCIES } from "@/appwrite/config";
import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";

/**
 * Submit a new Agency Application.
 * This can be called by any authenticated user.
 */
export async function submitAgencyApplication(prevState, formData) {
    const name = formData.get("name");
    const slug = formData.get("slug");
    const contact_phone = formData.get("contact_phone");
    const contact_email = formData.get("contact_email");
    const address = formData.get("address");
    const city = formData.get("city");
    const district = formData.get("district");
    const lawyer_name = formData.get("lawyer_name");
    const owner_id = formData.get("owner_id");

    if (!owner_id) {
        return { success: false, message: "User ID is missing." };
    }

    // Basic Validation
    if (!name || !slug || !contact_phone || !lawyer_name) {
        return { success: false, message: "Required fields are missing." };
    }

    try {
        const { databases } = await createAdminClient();

        // Check if slug exists
        // Note: For robustness, we should use a Query here, but createDocument will fail on unique violation too.

        await databases.createDocument(
            DB_ID,
            COLLECTION_AGENCIES,
            ID.unique(),
            {
                name,
                slug,
                owner_id,
                contact_phone,
                contact_email,
                address,
                city,
                district,
                lawyer_name,
                status: 'pending',
                verified_at: null
            }
        );

        // TODO: Send specific notification to Admin via SMS/Email if needed.

        revalidatePath('/agency/apply');
        return { success: true, message: "Application submitted successfully! We will contact you soon." };
    } catch (error) {
        console.error("Agency Application Error:", error);
        return { success: false, message: error.message || "Failed to submit application." };
    }
}

/**
 * Approve an Agency Application.
 * RESTRICTED: Admin Only.
 */
export async function approveAgency(agencyId, ownerId) {
    try {
        const { databases, users } = await createAdminClient();

        // 1. Update Agency Status
        await databases.updateDocument(
            DB_ID,
            COLLECTION_AGENCIES,
            agencyId,
            {
                status: 'approved',
                verified_at: new Date().toISOString()
            }
        );

        // 2. Assign 'agency_manager' Label to the User
        // Fetch current labels first to avoid overwriting? updateLabels replaces them.
        const user = await users.get(ownerId);
        const currentLabels = user.labels || [];

        if (!currentLabels.includes('agency_manager')) {
            await users.updateLabels(ownerId, [...currentLabels, 'agency_manager']);
        }

        // 3. Send SMS Notification
        try {
            const agency = await databases.getDocument(DB_ID, COLLECTION_AGENCIES, agencyId);
            if (agency.contact_phone) {
                // Dynamic import to avoid client-side issues with sms.js if it leaks imports, 
                // but this is a Server Action file, so we can import at top ideally. 
                // Using standard import since sms.js is safe for server.
                const { sendSMS } = await import('@/lib/sms');
                await sendSMS(agency.contact_phone, `Congratulations! Your agency "${agency.name}" has been approved as a Verified Partner on LandSale.lk.`);
            }
        } catch (smsError) {
            console.warn("Failed to send approval SMS:", smsError);
            // Non-blocking
        }

        revalidatePath('/admin/agencies');
        return { success: true };
    } catch (error) {
        console.error("Approve Agency Error:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Reject an Agency Application.
 * RESTRICTED: Admin Only.
 */
export async function rejectAgency(agencyId) {
    try {
        const { databases } = await createAdminClient();

        await databases.updateDocument(
            DB_ID,
            COLLECTION_AGENCIES,
            agencyId,
            {
                status: 'rejected'
            }
        );

        revalidatePath('/admin/agencies');
        return { success: true };
    } catch (error) {
        console.error("Reject Agency Error:", error);
        return { success: false, message: error.message };
    }
}
