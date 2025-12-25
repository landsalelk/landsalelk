/**
 * Email Service Abstraction
 * 
 * Handles sending notifications to users.
 * Currently logs to console. Can be extended to use Resend, SendGrid, etc.
 */

export const EmailService = {
    /**
     * Send an alert about a new matching property
     * @param {Object} params
     * @param {string} params.to - Recipient email
     * @param {string} params.subject - Email subject
     * @param {Object} params.listing - The matching property details
     * @param {Object} params.search - The saved search criteria
     */
    sendMatchAlert: async ({ to, listing, search }) => {
        // In a real implementation, you would call an external API here.
        // For now, we simulate sending by logging to the server console.

        console.log(`
        ==================================================
        [EMAIL SENT] to: ${to}
        Subject: New Match: ${listing.title} in ${listing.location}
        
        Hi there!
        
        We found a new property matching your search for:
        "${search.land_type} in ${search.location} under LKR ${search.max_price}"
        
        Property Details:
        - Title: ${listing.title}
        - Price: LKR ${listing.price.toLocaleString()}
        - Location: ${listing.location}
        - Link: https://landsale.lk/properties/${listing.$id}
        
        Happy Hunting!
        LandSale.lk Team
        ==================================================
        `);

        return true;
    }
};
