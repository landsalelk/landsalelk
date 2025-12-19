# Usability & Design Audit Report

This document identifies 50 usability, design, and technical issues within the current interface and codebase, prioritized for implementation.

## 🔴 High Priority (Critical UX/SEO/Bugs)

1.  **Mobile Menu Content Violation**
    *   **Issue:** The mobile hamburger menu contains category links (Lands, Houses) which violates the design rule that it should only contain Profile/Auth actions.
    *   **Fix:** Remove category links from the hamburger menu. Rely on the horizontal scroll or bottom nav for categories.
2.  **Client-Side Rendering of Homepage (SEO)**
    *   **Issue:** `HomePage` uses `useEffect` to fetch properties, causing the page to be blank (`return null`) or show a spinner on initial load. Search engines see an empty page.
    *   **Fix:** Convert `HomePage` to a Server Component and fetch data server-side.
3.  **Layout Shift (CLS)**
    *   **Issue:** The `if (!mounted) return null` pattern causes a massive layout shift (Flash of Invisible Content) on every load.
    *   **Fix:** Remove the hydration check or use a server-side rendered initial state.
4.  **Image Optimization Disabled**
    *   **Issue:** `PropertyCard` uses `<Image unoptimized />`, bypassing Next.js image optimization. This leads to slow page loads and high bandwidth usage.
    *   **Fix:** Remove `unoptimized` prop and configure `remotePatterns` in `next.config.mjs` for Appwrite/Unsplash.
5.  **Missing Skeleton Loading States**
    *   **Issue:** The page displays a generic spinner (`Loader2`) instead of skeleton UI (shimmer effects), making the app feel slower.
    *   **Fix:** Create a `<PropertyCardSkeleton />` and use it during data fetching.
6.  **Search Accessibility**
    *   **Issue:** The main search input in the Hero section lacks a `<label>` element, relying only on the placeholder.
    *   **Fix:** Add a visually hidden `<label>` for screen readers.
7.  **"Sign In" Visibility**
    *   **Issue:** The "Sign In" link in the desktop header is plain text and lacks visual hierarchy compared to the "Post Ad" button.
    *   **Fix:** Style "Sign In" as a secondary button (ghost or outline variant).
8.  **Mobile Bottom Nav Redundancy**
    *   **Issue:** The mobile bottom nav includes a "Search" icon which duplicates the functionality of the "Properties" link, confusing users.
    *   **Fix:** Consolidate into a single clear "Explore" or "Properties" tab.
9.  **Negative Margin Overlap**
    *   **Issue:** The Categories section uses `-mt-10`. On smaller screens or different text wrapping, this could obscure Hero content.
    *   **Fix:** Use proper absolute positioning or overlapping grid layouts instead of negative margins, or ensure Z-index context is robust.
10. **Touch Targets**
    *   **Issue:** Mobile bottom nav buttons are close together.
    *   **Fix:** Ensure a minimum touch target size of 44x44px for all mobile interaction points.

## 🟠 Medium Priority (UX Improvements/Best Practices)

11. **Contrast Issues on Hero**
    *   **Issue:** White text on the `live-gradient` background may have insufficient contrast if the gradient renders lightly or fails.
    *   **Fix:** Add a slight text shadow or a semi-transparent dark overlay behind the text.
12. **Form Validation Feedback**
    *   **Issue:** The Newsletter form provides generic error messages via `toast.error("Something went wrong")`.
    *   **Fix:** Display specific error messages returned from the backend (e.g., "Email already subscribed").
13. **Navigation Consistency**
    *   **Issue:** "Legal" is in the main header, but "Legal Services" is in the footer.
    *   **Fix:** Standardize naming to "Legal Services" across both menus.
    *   **Action:** Update `Navbar.jsx`.
14. **Empty State Handling**
    *   **Issue:** If `getFeaturedProperties` returns empty, the section renders as an empty grid with no user feedback.
    *   **Fix:** Add a "No properties found" empty state component.
15. **WhatsApp Link Security**
    *   **Issue:** The WhatsApp button uses `window.open` without `noopener noreferrer` protection explicitly (though browsers handle it, it's best practice).
    *   **Fix:** Use a proper `<a>` tag with `rel="noopener noreferrer"`.
16. **Alt Text Quality**
    *   **Issue:** Fallback images use static alt text "Property", which describes nothing to screen readers.
    *   **Fix:** Use "Property listing in [Location]" for dynamic alt text logic.
    *   **Action:** Update `PropertyCard.jsx`.
17. **Title Truncation**
    *   **Issue:** Property titles are clamped to 1 line on desktop (`line-clamp-1`). Users might miss key details like "Annex for Rent".
    *   **Fix:** Allow 2 lines (`line-clamp-2`) on desktop cards.
18. **Badge Overlap**
    *   **Issue:** The "Sale" badge inside the property card image overlaps with the image content and might clash with the "Heart" icon visually.
    *   **Fix:** Move the badge to the top-left corner and ensure spacing from other absolute elements.
19. **Price Formatting**
    *   **Issue:** `maximumFractionDigits: 0` is used. While good for large numbers, it hides precision if needed.
    *   **Fix:** Ensure strict formatting rules (e.g., "LKR 25M") for cleaner display.
20. **Interactive Map Missing**
    *   **Issue:** Users cannot search by map view.
    *   **Fix:** Implement the "Interactive Map Search" from Roadmap.
21. **Filter Visibility**
    *   **Issue:** Filters are hidden behind the search logic; they should be more accessible on the home page (e.g., Price Range dropdown).
    *   **Fix:** Add quick filters (Price, Type) to the Hero search box.
22. **Trust Signals**
    *   **Issue:** "Trusted Agents 1,200+" is a static number.
    *   **Fix:** Fetch real agent counts or use a "Verified" badge system.
23. **Scroll Behavior**
    *   **Issue:** The Navbar changes style on scroll (`window.scrollY > 20`). This can cause a flicker on refresh if scrolled.
    *   **Fix:** Initialize `scrolled` state correctly based on initial `window.scrollY`.
24. **Z-Index Layering**
    *   **Issue:** Hero blobs use absolute positioning. Need to ensure they don't cover clickable elements.
    *   **Fix:** Set `z-0` for blobs and `z-10` for content explicitly.
25. **Button Text Consistency**
    *   **Issue:** "Post Ad" vs "Post Free Ad" text varies between Navbar and Hero CTA.
    *   **Fix:** Standardize to "Post Property" or "List for Free".
26. **Color Palette Alignment**
    *   **Issue:** Use of `bg-green-50` vs brand `bg-emerald-50`.
    *   **Fix:** Replace all hardcoded `green` classes with `emerald` (primary brand color).
27. **Font Loading**
    *   **Issue:** "Sinhala Greeting" uses a custom font class. If the font fails to load, it looks generic.
    *   **Fix:** Ensure font fallback stack is properly defined in Tailwind config.
28. **Image Error Handling**
    *   **Issue:** `onError` in `PropertyCard` switches to a fallback, but might cause a visual flash.
    *   **Fix:** Use a blurry placeholder or skeleton while loading.
29. **Global Scrollbar**
    *   **Issue:** `hide-scrollbar` class might be used excessively, hiding scroll affordance from desktop users.
    *   **Fix:** Only hide scrollbars on specific mobile horizontal containers.
30. **Touch Gestures**
    *   **Issue:** No swipe support for the property gallery (if implemented) or carousels.
    *   **Fix:** Implement swipe gestures for mobile users.

## 🟡 Low Priority / Feature Requests (Roadmap Alignment)

31. **Comparison UI**
    *   **Issue:** The comparison floating button might obscure content on mobile.
    *   **Fix:** Dock it to the bottom nav or make it collapsible.
32. **Notifications Position**
    *   **Issue:** Toasts appear "top-center", covering the Navbar.
    *   **Fix:** Move toasts to "bottom-right" on desktop and "top-center" (below nav) on mobile.
33. **Listing Date**
    *   **Issue:** Property cards don't show when they were listed.
    *   **Fix:** Add "Listed [x] days ago" to indicate freshness.
34. **Agent Branding**
    *   **Issue:** Property cards lack agent information.
    *   **Fix:** Add a small agent avatar/name to the card footer.
35. **Favicon & Branding**
    *   **Issue:** Verify favicon consistency with the new logo.
    *   **Fix:** Ensure `favicon.ico` matches the brand color.
36. **Social Share**
    *   **Issue:** Only WhatsApp share is available.
    *   **Fix:** Add native Web Share API support for mobile.
37. **404 Page**
    *   **Issue:** Generic 404 page (if default Next.js).
    *   **Fix:** Create a branded Custom 404 page with search.
38. **PWA Install Prompt**
    *   **Issue:** Manifest exists but no install prompt.
    *   **Fix:** Add a "Install App" button in the mobile menu.
39. **Print Styles**
    *   **Issue:** Printing a property page likely breaks layout.
    *   **Fix:** Add `@media print` styles to hide nav/footer.
    *   **Action:** Update `app.css`.
40. **Currency Converter**
    *   **Issue:** Foreign buyers see only LKR.
    *   **Fix:** Add a currency toggle (Roadmap item).
41. **Language Support**
    *   **Issue:** Site is English-first.
    *   **Fix:** Implement the planned Sinhala/Tamil toggle.
    *   **Action:** Add `i18n` support.
42. **Input Types**
    *   **Issue:** Phone inputs should use `type="tel"` and `inputMode="numeric"`.
    *   **Fix:** Audit all form inputs.
43. **Address Autocomplete**
    *   **Issue:** Search input is free text.
    *   **Fix:** Integrate Google Places Autocomplete.
44. **Reporting Mechanism**
    *   **Issue:** No way to report spam/scams on a listing.
    *   **Fix:** Add "Report Ad" link on property details.
    *   **Action:** Update `PropertyDetails` component.
45. **Infinite Scroll**
    *   **Issue:** Pagination (if any) is clunky.
    *   **Fix:** Implement Infinite Scroll for property lists.
    *   **Action:** Roadmap item.
46. **Dark Mode**
    *   **Issue:** No dark mode support.
    *   **Fix:** Add theme toggle.
    *   **Action:** Roadmap item.
47. **Login Redirection**
    *   **Issue:** Clicking "Heart" on a card redirects to login?
    *   **Fix:** Ensure it redirects *back* to the property after login.
48. **Video Support**
    *   **Issue:** No video tours support.
    *   **Fix:** Add video player to property gallery.
49. **Breadcrumbs**
    *   **Issue:** No breadcrumb navigation on property pages.
    *   **Fix:** Add Breadcrumbs for better SEO and navigation.
50. **Metadata Images**
    *   **Issue:** Dynamic OG images for properties are missing.
    *   **Fix:** Generate OG images using `vercel/og` or Appwrite Functions.
