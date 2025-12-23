# Usability & Implementation Audit: LandSale.lk

This document outlines the top 50 identified usability issues, performance bottlenecks, and implementation gaps within the current system, prioritized by impact on user experience.

## Executive Summary

The platform has a solid visual foundation using Tailwind CSS and Framer Motion. However, significant UX friction exists in core workflows like Listing Creation and Property Viewing, primarily due to heavy client-side processing, unoptimized mobile interactions, and lack of error recovery mechanisms.

---

## 🚨 High Priority (Critical UX/Performance Blockers)

These issues directly affect conversion, data loss, or significant user frustration.

1.  **Risk of Data Loss in Create Listing**
    *   **Issue:** The "Post Ad" form (`src/app/properties/create/page.js`) relies entirely on local React state. If the browser refreshes or the user navigates away (e.g., swipes back on mobile), all entered data is lost.
    *   **Recommendation:** Implement `localStorage` persistence for the `formData` state or use a dedicated draft system in Appwrite.

2.  **Heavy Main Thread Blocking (Tesseract.js)**
    *   **Issue:** The OCR feature imports `tesseract.js` (v5) directly in the component. This large bundle loads immediately, and processing runs on the main thread, freezing the UI on low-end devices.
    *   **Recommendation:** Use dynamic imports (`next/dynamic`) for the OCR module and offload processing to a Web Worker or an Appwrite Function.

3.  **Serial Image Uploads (Slow & Fragile)**
    *   **Issue:** Images are uploaded one-by-one in a loop (`for (const img of images)`). If one fails, the process continues but may leave the listing in a partial state or replace the failed image with a placeholder without user consent.
    *   **Recommendation:** Use `Promise.all` for parallel uploads. Implement a retry mechanism for failed individual files.

4.  **Unthrottled Scroll Event Listeners**
    *   **Issue:** The `Navbar` component attaches a `scroll` event listener that fires on every pixel of movement. This causes layout thrashing and jank, especially on mobile.
    *   **Recommendation:** Wrap the scroll handler in a `throttle` or `debounce` function (e.g., from `lodash` or custom hook).

5.  **Missing Authentication Guard on "Make Offer"**
    *   **Issue:** The `handleMakeOffer` function checks `account.get()` *after* the user submits the form. If the session is expired, the user gets an error toast instead of a prompt to login, losing their written message.
    *   **Recommendation:** Check auth state on mount or when opening the modal. If unauthenticated, save the draft offer and redirect to login, or use a "Login to Continue" modal flow.

6.  **Mobile Menu Body Scroll Bleed**
    *   **Issue:** Opening the mobile menu (`src/components/layout/Navbar.jsx`) does not lock the `body` scroll. Users trying to scroll the menu often scroll the page behind it instead.
    *   **Recommendation:** Add `overflow-hidden` to the `<body>` tag when `isOpen` is true.

7.  **Inaccessible "Sticky" Elements on Mobile**
    *   **Issue:** The Agent Contact card and Gallery in `PropertyDetailsPage` are sticky. On small screens, sticky elements often cover content or become unreachable if they are taller than the viewport.
    *   **Recommendation:** On mobile, disable `sticky` positioning for tall elements. Use a fixed bottom bar for primary actions ("Call Agent", "WhatsApp") instead.

8.  **Fake "Scanning" Delay**
    *   **Issue:** The "Scanning for agents" step introduces a hardcoded 2.5s delay (`setTimeout`). Frequent users (agents/investors) will find this artificial wait frustrating.
    *   **Recommendation:** Remove the fake delay or make it a non-blocking background animation while the user continues filling the form.

9.  **Fragile Image Data Structure**
    *   **Issue:** The `images` field in the `Listings` collection is stored as a JSON string (`JSON.stringify(imageIds)`). This makes database-level filtering (e.g., "listings with images") impossible and requires fragile parsing on every read.
    *   **Recommendation:** Migrate the Appwrite schema to use a native `String[]` (array) attribute for `images`.

10. **Session "Flicker" on Load**
    *   **Issue:** The `Navbar` initializes `user` state as `null` and checks auth in `useEffect`. This causes the "Sign In" button to render briefly before switching to the user profile, causing a layout shift.
    *   **Recommendation:** Use a context provider with a loading state, or checking auth in a Server Component (if moving to full RSC) or middleware to preset the initial UI state.

11. **Mobile Gallery Limitation**
    *   **Issue:** The mobile property gallery only shows 5 dots for navigation. Users cannot easily see "Image 8 of 15" or swipe through a grid view.
    *   **Recommendation:** Implement a "View All Photos" grid modal for mobile users.

12. **Insecure "Claim Listing" Logic**
    *   **Issue:** The `claimListing` server action accepts `userId` as an argument. While the `secret` provides security, relying on the client to pass the correct `userId` is an anti-pattern.
    *   **Recommendation:** Derive `userId` securely from the authenticated session (`account.get()`) inside the server action.

13. **Lack of Deep Linking for Auth**
    *   **Issue:** If a user clicks a protected action (like "Save Property") and is redirected to login, they are dumped on the dashboard afterwards, not back to the property they were viewing.
    *   **Recommendation:** Pass a `?redirect=/properties/[id]` parameter to the login page and handle the callback.

14. **Undefined "Status" Feedback**
    *   **Issue:** When a user creates a listing, they are redirected to `/profile`. If the listing is "pending approval", there is no clear immediate feedback explaining *why* it's not visible publicly.
    *   **Recommendation:** Redirect to a "Submission Success" page that explicitly explains the verification timeline.

15. **Missing Input Labels (Accessibility)**
    *   **Issue:** Many form inputs in `CreateListingPage` use `placeholder` as the only label or have visual labels not programmatically associated (`htmlFor`).
    *   **Recommendation:** Ensure all `<input>` elements have associated `<label>` tags with matching `for`/`id` attributes.

---

## ⚠️ Medium Priority (Friction & Polish)

These issues reduce usability efficiency or make the application feel less professional.

16. **Rigid Price Input**
    *   **Issue:** The price input is a standard text/number field. Users often struggle with counting zeros for millions (e.g., 50000000).
    *   **Recommendation:** Use a currency input mask (e.g., `react-currency-input-field`) that formats as `50,000,000` while typing.

17. **Hidden "Agent Scanning" Exit**
    *   **Issue:** If the user doesn't want an agent, the "Skip agent assistance" button appears only *after* a match or scan. It should be available immediately.
    *   **Recommendation:** Make the "Skip" button always visible and prominent.

18. **Overwhelming Form Length**
    *   **Issue:** The "Property Details" step (Step 3) is very long on mobile.
    *   **Recommendation:** Break Step 3 into two sub-steps: "Basic Info" (Beds/Baths) and "Detailed Specs" (Deeds/Approvals).

19. **Generic Error Messages**
    *   **Issue:** `toast.error("Failed to create listing")` gives no clue if the error was a network issue, validation error, or file size limit.
    *   **Recommendation:** Parse the Appwrite error code and return specific messages (e.g., "Image too large", "Title required").

20. **Lack of "Share" Feedback**
    *   **Issue:** The WhatsApp share button opens a new tab. The app doesn't know if the user actually sent the message.
    *   **Recommendation:** While we can't track external actions perfectly, we can listen for the `click` event to trigger a "Next Step" or "Mark as Contacted" state in the UI.

21. **No "Draft" Indicator**
    *   **Issue:** Users have no way to know if their listing is saved as a draft or if they can resume later.
    *   **Recommendation:** Add a visual "Saved just now" or "Unsaved changes" indicator in the header.

22. **Mobile Nav Icon Clarity**
    *   **Issue:** The bottom mobile nav uses icons only. New users might not understand what the "Heart" or "User" icons represent compared to standard conventions.
    *   **Recommendation:** Add small text labels (10px size) below icons in the bottom nav.

23. **Search Filters on Mobile**
    *   **Issue:** The search bar in the Navbar is minimal. Accessing detailed filters (Price range, Beds) requires navigating to a separate page or is hidden.
    *   **Recommendation:** Implement a "Filters" bottom sheet that can be triggered directly from the home or search results page.

24. **Image "Unoptimized" Usage**
    *   **Issue:** The `PropertyDetailsPage` uses `unoptimized` on the `next/image` component for the mobile gallery. This serves full-resolution images, wasting bandwidth.
    *   **Recommendation:** Remove `unoptimized` and configure `next.config.mjs` to properly resize images from the Appwrite bucket domain.

25. **Hardcoded Currency**
    *   **Issue:** `LKR` is hardcoded in many places. If the platform expands or supports foreign buyers viewing in USD, this will require a refactor.
    *   **Recommendation:** Use a centralized configuration or helper `formatCurrency(amount, currency)` everywhere.

26. **Phone Number Formatting**
    *   **Issue:** Users can enter phone numbers in any format. This makes the `wa.me` link generation fragile.
    *   **Recommendation:** Use a phone number input library (`react-phone-number-input`) to enforce E.164 formatting (+94...).

27. **"Load More" vs Pagination**
    *   **Issue:** Search results (implied) rely on standard pagination. Mobile users prefer "Load More" or Infinite Scroll.
    *   **Recommendation:** Implement "Load More" button functionality for listing grids.

28. **Empty State for "Related Properties"**
    *   **Issue:** If no related properties are found, the section just vanishes. This is a missed opportunity to keep the user engaged.
    *   **Recommendation:** Show "Other properties in [City]" or "Popular in [Category]" as a fallback.

29. **Non-Interactive Maps**
    *   **Issue:** The "ScrollMap" is visual but users cannot interact (pan/zoom) to see the neighborhood context easily without leaving the flow.
    *   **Recommendation:** Allow expanding the map to fullscreen.

30. **Notification "Toast" Overload**
    *   **Issue:** `sonner` toasts are great, but if multiple errors occur (e.g., 5 failed image uploads), the screen might get spammed.
    *   **Recommendation:** Group similar errors or limit the number of visible toasts.

---

## ℹ️ Low Priority (Visuals & Future Proofing)

These are improvements that add delight or solve edge cases.

31. **Skeleton Loading Jitters:** The skeleton loader heights sometimes don't match the final content, causing a layout jump when data loads.
32. **Missing "Back to Top":** Long property pages on mobile are tedious to scroll back up.
33. **Image Gallery Swipe:** The mobile gallery relies on arrow buttons. It should support native touch swiping.
34. **Avatar Initials:** The user avatar uses a simple initial. A generated gradient or `boring-avatars` would look more polished.
35. **Date Formatting:** "Created at" dates are often raw ISO strings or standard dates. Use "2 hours ago" (relative time) for better context.
36. **Agent Rating Context:** "4.9 Rating" is shown, but not the *number* of reviews (e.g., "(12 reviews)"). This reduces trust.
37. **Video Player Controls:** If video is supported, custom controls are better than default HTML5 controls for branding.
38. **Social Share Preview:** The success modal "Share" button is generic. Show a preview of the message card that will be sent.
39. **Legal Vault Icons:** The icons in the Navbar for "Vault" etc. are generic SVGs. Replace with Lucide icons for consistency.
40. **Button "Active" States:** Mobile bottom nav buttons don't have a clear "active" state indication (color change/glow) for the current page.
41. **Browser Title Dynamic Update:** When switching tabs, change the title to "Come back!" or similar (micro-interaction).
42. **404 Page Polish:** The 404 page is functional but could link to search with some pre-filled filters ("Looking for land?").
43. **Print Styles:** Users often print listing pages. Add a `@media print` CSS block to hide navbars and ads.
44. **Copy Link Feedback:** When clicking "Share", it should copy to clipboard automatically if the native share API fails.
45. **Input Auto-Capitalization:** Property titles should auto-capitalize words.
46. **"New" Badge:** Fresh listings (< 3 days) should have a "New" badge on the card.
47. **Favorite Animation:** The heart icon animation is minimal. A "particle burst" animation adds delight.
48. **Breadcrumbs:** Deep navigation (Home > Lands > Colombo > Listing) is missing breadcrumbs for easy back-navigation.
49. **PWA Install Prompt:** Custom install prompt for mobile users instead of the browser default.
50. **Offline Support:** Basic offline fallback page is missing (Next.js default is usually enough, but a custom branding one is better).

---

## Next Steps for Implementation

1.  **Immediate Fix:** Apply the **Debounce fix** to the Navbar scroll listener.
2.  **Quick Win:** Add **Auth Guards** to the "Make Offer" button.
3.  **Critical Refactor:** Migrate the **OCR and Image Upload** logic to use `Promise.all` and dynamic imports.
4.  **Backend Update:** Update `owner-verification.js` to strictly validate `userId` from the session.

This roadmap addresses the technical debt preventing the platform from scaling to thousands of users while ensuring the current user base has a smooth experience.
