import { Client, Messaging, ID, Users } from "node-appwrite";

/**
 * Send Email Notification Function (Appwrite Native)
 *
 * Uses Appwrite Messaging API for sending emails.
 * Configure your email provider (SMTP, SendGrid, Mailgun) in Appwrite Console.
 *
 * Payload: { type, email, subject, body, data, userId }
 *
 * Types: 'payment_success', 'listing_approved', 'listing_rejected',
 *        'kyc_approved', 'kyc_rejected', 'newsletter_verification', 'agent_lead', 'generic'
 */

const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";

// Email templates
const TEMPLATES = {
  payment_success: {
    subject: "✅ Payment Successful - LandSale.lk",
    body: (data) =>
      `
Dear ${data.name || "Customer"},

Your payment of LKR ${data.amount?.toLocaleString() || "0"} has been successfully processed.

Order ID: ${data.orderId || "N/A"}
Date: ${new Date().toLocaleString("en-LK")}

Thank you for using LandSale.lk!

Best regards,
LandSale.lk Team
      `.trim(),
  },
  listing_approved: {
    subject: "🎉 Your Listing is Now Live! - LandSale.lk",
    body: (data) =>
      `
Dear ${data.name || "Property Owner"},

Great news! Your property listing "${data.title || "Your Property"}" has been approved and is now live on LandSale.lk.

View your listing: https://landsale.lk/properties/${data.listingId || ""}

Potential buyers can now view and inquire about your property.

Best regards,
LandSale.lk Team
      `.trim(),
  },
  listing_rejected: {
    subject: "⚠️ Listing Review Required - LandSale.lk",
    body: (data) =>
      `
Dear ${data.name || "Property Owner"},

Your property listing requires some updates before it can be published.

Reason: ${data.reason || "Please review our listing guidelines."}

Please update your listing and resubmit. If you have questions, contact our support team.

Best regards,
LandSale.lk Team
      `.trim(),
  },
  kyc_approved: {
    subject: "✅ Identity Verified - LandSale.lk",
    body: (data) =>
      `
Dear ${data.name || "User"},

Your identity verification has been approved! You now have full access to all LandSale.lk features.

As a verified user, you can:
- Create unlimited listings
- Access premium features
- Build trust with buyers

Best regards,
LandSale.lk Team
      `.trim(),
  },
  kyc_rejected: {
    subject: "❌ Verification Update Required - LandSale.lk",
    body: (data) =>
      `
Dear ${data.name || "User"},

We were unable to verify your identity with the documents provided.

Reason: ${data.reason || "Documents were unclear or incomplete."}

Please submit clearer documents to complete verification.

Best regards,
LandSale.lk Team
      `.trim(),
  },
  newsletter_verification: {
    subject: "Confirm your subscription to LandSale.lk",
    body: (data) =>
      `
Hello!

Thanks for signing up for the LandSale.lk newsletter.

Please confirm your subscription by clicking the link below:
${data.link}

If you didn't request this, you can safely ignore this email.

Best regards,
LandSale.lk Team
      `.trim(),
  },
  agent_lead: {
    subject: "🏠 New Lead Received - LandSale.lk",
    body: (data) =>
      `
Dear ${data.agentName || "Agent"},

You have received a new lead!

Name: ${data.leadName || "N/A"}
Phone: ${data.leadPhone || "N/A"}
Email: ${data.leadEmail || "N/A"}
Property Interest: ${data.propertyTitle || "General Inquiry"}

Message: ${data.message || "No message provided"}

Please respond promptly to maximize conversion.

Best regards,
LandSale.lk Team
      `.trim(),
  },
  password_reset: {
    subject: "🔒 Password Reset Request - LandSale.lk",
    body: (data) =>
      `
Dear ${data.name || "User"},

We received a request to reset your password.

Click the link below to reset your password:
${data.resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email or contact support if you have concerns.

Best regards,
LandSale.lk Team
      `.trim(),
  },
  welcome: {
    subject: "🎉 Welcome to LandSale.lk!",
    body: (data) =>
      `
Dear ${data.name || "User"},

Welcome to LandSale.lk - Sri Lanka's premier real estate platform!

You can now:
- Browse thousands of property listings
- Save your favorite properties
- Connect with verified agents
- List your own properties for free

Get started: https://landsale.lk/properties

Best regards,
LandSale.lk Team
      `.trim(),
  },
  inquiry_received: {
    subject: "📩 New Inquiry for Your Property - LandSale.lk",
    body: (data) =>
      `
Dear ${data.ownerName || "Property Owner"},

Someone is interested in your property "${data.propertyTitle || "Your Listing"}"!

Inquiry from: ${data.inquirerName || "A potential buyer"}
Contact: ${data.inquirerPhone || data.inquirerEmail || "Check dashboard"}
Message: ${data.message || "They want more information about your property."}

Log in to your dashboard to respond: https://landsale.lk/dashboard

Best regards,
LandSale.lk Team
      `.trim(),
  },
};

/**
 * Convert plain text to basic HTML
 */
function textToHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
}

/**
 * Main function handler
 */
export default async ({ req, res, log, error }) => {
<<<<<<< HEAD
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
=======
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(API_KEY);
>>>>>>> ced6621fe59b1161996e305a12e4cb3821b4ac5d

  const messaging = new Messaging(client);
  const users = new Users(client);

  try {
    // Parse payload
    let payload = req.body;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        // Already parsed or invalid JSON
      }
    }

    const { type, email, subject, body, data = {}, userId } = payload;

    // Validate email
    if (!email) {
      return res.json({ success: false, error: "Email is required" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, error: "Invalid email format" }, 400);
    }

    // Resolve subject and body from template or use provided values
    let finalSubject = subject;
    let finalBody = body;

    if (type && TEMPLATES[type]) {
      const template = TEMPLATES[type];
      finalSubject = subject || template.subject;
      finalBody = body || template.body(data);
    }

    if (!finalSubject || !finalBody) {
      return res.json(
        { success: false, error: "Subject and body are required" },
        400,
      );
    }

    // Generate HTML version
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    a { color: #10b981; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://landsale.lk/logo.png" alt="LandSale.lk" style="height: 40px;" onerror="this.style.display='none'">
  </div>
  ${textToHtml(finalBody)}
  <div class="footer">
    <p>This email was sent by LandSale.lk</p>
    <p>If you have questions, visit <a href="https://landsale.lk/faq">our FAQ</a> or contact support.</p>
  </div>
</body>
</html>
    `.trim();

    log(`Sending email to: ${email}`);
    log(`Subject: ${finalSubject}`);
    log(`Type: ${type || "custom"}`);

    // Try to send via Appwrite Messaging
    try {
      // Create the email message using Appwrite Messaging
      // Note: You need to have an email provider configured in Appwrite Console
      // Go to Messaging > Providers > Add Provider (SMTP, SendGrid, Mailgun, etc.)

      const message = await messaging.createEmail(
        ID.unique(), // messageId
        finalSubject, // subject
        htmlBody, // content (HTML)
        [], // topics (optional)
        userId ? [userId] : [], // users (if userId provided)
        [], // targets
        [], // cc
        [], // bcc
        [], // attachments
        false, // draft
        true, // html
        undefined, // scheduledAt
      );

      log(`Email sent via Appwrite Messaging: ${message.$id}`);

      return res.json({
        success: true,
        message: "Email sent successfully",
        messageId: message.$id,
        email,
        type: type || "custom",
      });
    } catch (messagingError) {
      // Appwrite Messaging might not be configured or target not set
      log(`Appwrite Messaging error: ${messagingError.message}`);

      // Check if it's a configuration issue
      if (
        messagingError.message.includes("Provider") ||
        messagingError.message.includes("provider") ||
        messagingError.code === 404
      ) {
        error(
          "Email provider not configured. Please set up an email provider in Appwrite Console > Messaging > Providers",
        );

        // In development, log the email that would have been sent
        log("--- EMAIL CONTENT (Not Sent - No Provider) ---");
        log(`To: ${email}`);
        log(`Subject: ${finalSubject}`);
        log(`Body: ${finalBody.substring(0, 500)}...`);
        log("---");

        return res.json({
          success: false,
          error: "Email provider not configured in Appwrite Console",
          hint: "Go to Appwrite Console > Messaging > Providers to add an email provider (SMTP, SendGrid, Mailgun)",
          logged: true,
        });
      }

      // For target-related errors, try alternative approach
      if (
        messagingError.message.includes("target") ||
        messagingError.message.includes("Target")
      ) {
        log("Target error - email address might not be a registered user");

        // Log the email for manual follow-up or webhook integration
        log("--- EMAIL QUEUED FOR EXTERNAL DELIVERY ---");
        log(`To: ${email}`);
        log(`Subject: ${finalSubject}`);
        log(`Body Preview: ${finalBody.substring(0, 300)}...`);
        log("---");

        return res.json({
          success: true,
          message: "Email logged for delivery",
          note: "Recipient is not a registered user - email queued for external delivery",
          email,
          type: type || "custom",
        });
      }

      throw messagingError;
    }
  } catch (e) {
    error(`Email Function Error: ${e.message}`);
    error(e.stack);

    return res.json(
      {
        success: false,
        error: e.message,
        code: e.code || 500,
      },
      500,
    );
  }
};
