# User Journeys & System Documentation

## 1. User Personas

The platform supports distinct user roles, each with specific permissions and capabilities.

### 👤 **Visitor (Guest)**
*   **Definition:** Unauthenticated user visiting the site.
*   **Capabilities:**
    *   Browse and search properties.
    *   View property details (images, price, location).
    *   Read blog posts and FAQs.
    *   View public agent profiles.
*   **Limitations:** Cannot view owner contact details (in some flows), cannot post listings, cannot save favorites.

### 🏠 **Registered User (Property Owner / Seeker)**
*   **Definition:** Authenticated user with a valid account.
*   **Technical Identity:** Exists in Appwrite `users` service.
*   **Capabilities:**
    *   **Post Properties:** Create listings for Sale or Rent.
    *   **Manage Listings:** Edit, delete, or renew their own listings.
    *   **Favorites:** Save properties to a wishlist.
    *   **Offers:** Make price offers on listings.
    *   **Messaging:** Send inquiries to agents.
    *   **Profile:** Manage personal details and notification preferences.

### 💼 **Agent (Aspiring / Pending)**
*   **Definition:** A Registered User who has submitted an Agent Application.
*   **Technical Identity:** Has a document in `agents` collection with `status: 'pending'`.
*   **Capabilities:**
    *   All "Registered User" capabilities.
    *   Access to "Become an Agent" status tracker.
    *   Cannot yet access CRM tools or public agent directory.

### 🌟 **Agent (Verified)**
*   **Definition:** A professional agent with a verified profile.
*   **Technical Identity:** Has a document in `agents` collection with `is_verified: true` (or active status).
*   **Capabilities:**
    *   **Leads CRM:** Access to the Lead Management System.
    *   **Marketing Tools:** Access to "Marketing" and "Open Houses" dashboard.
    *   **Public Profile:** Listed in the "Find an Agent" directory.
    *   **Badges:** Display "Verified" badge on listings.
    *   **Analytics:** View detailed performance stats for listings.

### 🛡️ **Admin**
*   **Definition:** Platform administrator.
*   **Technical Identity:** Member of the Appwrite Team `team:admins`.
*   **Capabilities:**
    *   **Content Management:** Create/Edit Blog Posts, FAQs, CMS Pages.
    *   **Approvals:** Approve/Reject Agent Applications and KYC requests.
    *   **Oversight:** View all users, listings, and transaction logs.

---

## 2. Core User Journeys

### 🚀 **Journey 1: New User Registration**
**Goal:** Create an account to access advanced features.
1.  **Trigger:** User clicks "Sign In" or "Post Ad".
2.  **Action:** User selects "Register" and provides Name, Email, Password (or uses Social Auth).
3.  **System:** Creates Appwrite Account -> Triggers Email Verification.
4.  **Outcome:** User is redirected to **Dashboard**.

### 📝 **Journey 2: Posting a Property (The Owner Loop)**
**Goal:** List a property for sale or rent.
1.  **Entry:** User clicks "Post Property" from Navbar or Dashboard.
2.  **Step 1 (Basics):** Select Category (Land/House/Apartment) and Type (Sale/Rent).
3.  **Step 2 (Details):** Enter Price, Location (City/District), Description.
4.  **Step 3 (Media):** Upload Images (Client-side OCR extracts data if applicable).
5.  **Step 4 (Owner Verification):**
    *   System generates a secure `verification_token`.
    *   User enters Owner Phone Number.
    *   System sends SMS with a verification link (e.g., `landsale.lk/verify-owner/[token]`).
6.  **Step 5 (Submission):** Listing is saved as `pending_owner` or `active` depending on flow.
7.  **Outcome:** Listing appears on the site once verified.

### 🕵️ **Journey 3: Discovery & Inquiry (Buyer Flow)**
**Goal:** Find a property and contact the seller.
1.  **Search:** User enters keywords or selects filters (Location, Price, Type) on Homepage.
2.  **Browse:** Results are displayed as cards. User clicks a card.
3.  **View Details:** User views images, description, and location.
4.  **Action:**
    *   **Call:** Click "Call Agent" (reveals number).
    *   **WhatsApp:** Click "WhatsApp" (opens pre-filled chat).
    *   **Offer:** Click "Make an Offer" -> Enter amount -> Submit.
5.  **Outcome:** Inquiry is recorded in `messages` and `agent_leads` (if recipient is an agent).

### 👔 **Journey 4: Becoming an Agent**
**Goal:** Upgrade account to Agent status.
1.  **Entry:** Dashboard -> "Become an Agent".
2.  **Form:**
    *   Personal Info (Bio, Experience).
    *   Service Areas (Districts/Cities).
    *   Upload NIC/ID for KYC.
3.  **Submission:** Creates document in `agents` and `kyc_requests`.
4.  **Review:** Admin reviews the application.
5.  **Approval:** Admin updates status to `active`/`verified`.
6.  **Outcome:** User dashboard transforms to include Agent Tools (Leads, Marketing).

### 📈 **Journey 5: Agent Lead Management**
**Goal:** Manage inquiries and close deals.
1.  **Trigger:** Agent receives a new inquiry (Message or WhatsApp click).
2.  **Notification:** Email/SMS alert sent to Agent.
3.  **Action:** Agent logs into Dashboard -> "Leads CRM".
4.  **Workflow:**
    *   View "New Leads".
    *   Update Status: "Contacted" -> "Viewing Scheduled" -> "Negotiation".
    *   Add Notes: "Customer looking for 3BR near school."
5.  **Outcome:** Deal is marked "Closed" or "Lost".

---

## 3. Technical Implementation Map

This table maps user actions to the underlying code and database architecture.

| Feature / Journey | Page Route (`src/app/`) | Database Collection (`constants.js`) | Key Actions / Functions |
| :--- | :--- | :--- | :--- |
| **Registration** | `/auth/register` | `users` (Appwrite Auth) | `account.create`, `account.createEmailSession` |
| **Dashboard** | `/dashboard/page.js` | `listings`, `favorites`, `messages` | `getUserListings`, `getUserFavorites` |
| **Create Listing** | `/properties/create` | `listings` | `createListing`, `tesseract.js` (OCR) |
| **View Listing** | `/properties/[id]` | `listings`, `users_extended` | `getListing`, `incrementViewCount` |
| **Agent Profile** | `/agents/[id]` | `agents`, `reviews` | `getAgentProfile`, `getAgentListings` |
| **Leads CRM** | `/dashboard/leads` | `agent_leads` | `updateLeadStatus`, `addLeadNote` |
| **Agent Apply** | `/become-agent` | `agents`, `kyc_requests` | `createAgentProfile`, `uploadKYC` |
| **Search** | `/search/page.js` | `listings` | `Query.search`, `Query.equal` |
| **Notifications** | Global (Toast/Header) | `notifications` | `getUnreadNotifications` |
| **Wallet** | `/dashboard/wallet` | `user_wallets`, `transactions` | `getWalletBalance` |

### Key System Components
*   **Authentication:** Handled client-side via `src/lib/appwrite.js`.
*   **Role Check:** Performed in `DashboardPage` by querying `COLLECTION_AGENTS`.
*   **Validation:** SMS Verification via `functions/send-otp-sms` (Appwrite Function).
*   **Analytics:** Custom implementations for listing views (`views_count`) and agent response times.

---

## 4. Current Limitations & Notes
*   **Auth Redirects:** Dashboard pages handle auth checks individually; no global middleware exists.
*   **Agent Data:** Agent details are stored in a separate `agents` collection, linked to the main `users` account by `user_id`.
*   **Mobile Experience:** The "Hamburger Menu" is strictly for Auth/Profile actions; Category navigation is handled via horizontal scrolls on mobile.
