/**
 * WhatsApp Business API Service Library
 * 
 * A reusable WhatsApp messaging service using Meta's Cloud API.
 * 
 * IMPORTANT: This must only be used in Server Components, Server Actions, or API Routes.
 * Do not import this directly into Client Components.
 * 
 * @example
 * import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/whatsapp';
 * 
 * // Send template message
 * const result = await sendWhatsAppTemplate('94710458619', 'hello_world', 'en_US');
 * 
 * // Send text message (requires 24-hour conversation window)
 * const result = await sendWhatsAppMessage('94710458619', 'Hello from LandSale.lk!');
 */

const WHATSAPP_API_VERSION = 'v22.0';

/**
 * Get WhatsApp configuration from environment
 */
function getConfig() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    return { phoneNumberId, accessToken, businessAccountId, verifyToken };
}

/**
 * Format phone number to WhatsApp format (without + and spaces)
 * @param {string} phone - Phone number in any format
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 94 (Sri Lanka country code)
    if (cleaned.startsWith('0')) {
        cleaned = '94' + cleaned.substring(1);
    }

    // If doesn't start with country code, assume Sri Lanka
    if (cleaned.length === 9) {
        cleaned = '94' + cleaned;
    }

    return cleaned;
}

/**
 * Send a template message via WhatsApp
 * Template messages can be sent anytime without requiring a conversation window.
 * 
 * @param {string} recipient - Phone number (e.g., 94710458619)
 * @param {string} templateName - Name of the approved template
 * @param {string} languageCode - Language code (e.g., 'en_US', 'si')
 * @param {Array} components - Optional template components for variables
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendWhatsAppTemplate(recipient, templateName, languageCode = 'en_US', components = []) {
    const { phoneNumberId, accessToken } = getConfig();

    if (!phoneNumberId || !accessToken) {
        console.error('WhatsApp API credentials are not configured');
        return { success: false, error: 'WhatsApp credentials missing' };
    }

    try {
        const formattedPhone = formatPhoneNumber(recipient);

        const payload = {
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: languageCode
                }
            }
        };

        // Add components if provided (for template variables)
        if (components.length > 0) {
            payload.template.components = components;
        }

        const response = await fetch(
            `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (response.ok) {
            console.log('WhatsApp template message sent:', data);
            return { success: true, data };
        } else {
            console.error('WhatsApp API error:', data);
            return {
                success: false,
                error: data.error?.message || 'WhatsApp message failed',
                details: data.error
            };
        }
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send a text message via WhatsApp
 * NOTE: This only works within a 24-hour conversation window after user initiates contact.
 * 
 * @param {string} recipient - Phone number
 * @param {string} message - Text message content
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function sendWhatsAppMessage(recipient, message) {
    const { phoneNumberId, accessToken } = getConfig();

    if (!phoneNumberId || !accessToken) {
        console.error('WhatsApp API credentials are not configured');
        return { success: false, error: 'WhatsApp credentials missing' };
    }

    try {
        const formattedPhone = formatPhoneNumber(recipient);

        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: {
                preview_url: true,
                body: message
            }
        };

        const response = await fetch(
            `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (response.ok) {
            console.log('WhatsApp message sent:', data);
            return { success: true, data };
        } else {
            console.error('WhatsApp API error:', data);
            return {
                success: false,
                error: data.error?.message || 'WhatsApp message failed',
                details: data.error
            };
        }
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send property verification link via WhatsApp
 * 
 * @param {string} recipient - Owner's phone number
 * @param {Object} listing - Listing details
 * @returns {Promise<{success: boolean, data?: object, error?: string, smsResult?: object}>}
 */
export async function sendVerificationLinkWhatsApp(recipient, listing) {
    // Use the hello_world template for testing
    // In production, create a custom template for property verification
    const components = [
        {
            type: 'body',
            parameters: [
                { type: 'text', text: listing.title },
                { type: 'text', text: `Rs. ${listing.price?.toLocaleString()}` },
                { type: 'text', text: listing.agentName || 'LandSale Agent' },
                { type: 'text', text: listing.verificationLink }
            ]
        }
    ];

    // For now, use hello_world template (no custom template yet)
    const result = await sendWhatsAppTemplate(recipient, 'hello_world', 'en_US');

    // Log the attempt for monitoring
    console.log(`WhatsApp verification sent to ${recipient}:`, result.success ? 'Success' : result.error);

    return result;
}

/**
 * Verify webhook callback from Meta
 * Used for setting up the webhook endpoint
 * 
 * @param {Object} query - Query parameters from the webhook request
 * @returns {{verified: boolean, challenge?: string}}
 */
export function verifyWebhook(query) {
    const { verifyToken } = getConfig();

    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully');
        return { verified: true, challenge };
    }

    console.error('Webhook verification failed');
    return { verified: false };
}

/**
 * Process incoming webhook events from WhatsApp
 * 
 * @param {Object} body - Webhook request body
 * @returns {Object} Parsed message data
 */
export function processWebhookEvent(body) {
    try {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) {
            return { type: 'unknown', data: null };
        }

        // Handle incoming messages
        if (value.messages?.[0]) {
            const message = value.messages[0];
            const contact = value.contacts?.[0];

            return {
                type: 'message',
                data: {
                    from: message.from,
                    name: contact?.profile?.name || 'Unknown',
                    messageId: message.id,
                    timestamp: message.timestamp,
                    messageType: message.type,
                    text: message.text?.body || null,
                    // Handle other message types (image, document, etc.)
                    media: message.image || message.document || message.audio || null
                }
            };
        }

        // Handle message status updates
        if (value.statuses?.[0]) {
            const status = value.statuses[0];
            return {
                type: 'status',
                data: {
                    messageId: status.id,
                    recipientId: status.recipient_id,
                    status: status.status, // sent, delivered, read, failed
                    timestamp: status.timestamp,
                    errors: status.errors || null
                }
            };
        }

        return { type: 'unknown', data: value };
    } catch (error) {
        console.error('Error processing webhook event:', error);
        return { type: 'error', error: error.message };
    }
}

const whatsappService = {
    sendWhatsAppTemplate,
    sendWhatsAppMessage,
    sendVerificationLinkWhatsApp,
    verifyWebhook,
    processWebhookEvent,
    formatPhoneNumber
};

export default whatsappService;
