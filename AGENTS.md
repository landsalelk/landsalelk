# Agent Instructions & Coding Standards 🤖

This file contains specific instructions for AI agents and developers working on the LandSale.lk codebase.

## 🌍 Appwrite Configuration
*   **Regional Endpoint**: Always use the Singapore endpoint `https://sgp.cloud.appwrite.io/v1` to prevent "Project not found" errors. The `src/lib/appwrite.js` file handles this automatically, but be aware when using cURL or raw API calls.
*   **InputFile Import**: When using `node-appwrite` v14+, always import `InputFile` from `node-appwrite/file`:
    ```javascript
    import { InputFile } from 'node-appwrite/file';
    ```
*   **Parsing Attributes**: Appwrite may return array/object attributes as JSON strings. Always try-catch `JSON.parse` when accessing complex attributes like `activity_log` or `features`.

## 🏗️ Architecture & Patterns
*   **Next.js App Router**: Use Server Actions for data mutations. Keep Client Components (`'use client'`) at the leaf nodes where possible.
*   **Tailwind CSS v4**: We use Tailwind v4. Configuration is in `src/app/app.css` via the `@theme` directive.
*   **Skeleton Loading**: Prefer Shimmer/Skeleton effects over spinning loaders for better UX.

## 📦 Key Libraries
*   **Tesseract.js**: Used for OCR. **Warning**: Large impact on bundle size. Ensure it is dynamically imported or only loaded on client-side on specific routes (e.g., listing creation).
*   **Lucide React**: Use `lucide-react` for all icons.
*   **Sonner**: Use `sonner` for toast notifications.

## ⚠️ Known Issues & Workarounds
*   **Tailwind v4 on Linux/Musl**: The project depends on `lightningcss-linux-x64-musl`. **Do not remove this dependency**, or builds on Appwrite Cloud (Alpine Linux) will fail.
*   **Verification Flow**: The `verify-owner` logic relies on SMS tokens. Ensure `send-otp-sms` function is deployed and active.

## 🧪 Testing
*   **Verification**: Always verify frontend changes by running the dev server and checking key flows (Login, Search, Create Listing).
*   **Playwright**: Use Playwright for E2E testing.

## 📝 Commit & Git
*   **Git Integration**: Pushing to `main` triggers a production deployment. Ensure local tests pass before merging.
