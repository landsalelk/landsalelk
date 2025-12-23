# Palette's Journal

## 2025-05-22 - Client-Side Auth Flicker
**Learning:** Initializing user state to `null` (logged out) in client-side auth checks causes a "Sign In" button to flash before the user session is confirmed.
**Action:** Initialize auth state to `undefined` (loading) and render Skeletons/Shimmers until the auth check completes to provide a stable visual experience.
