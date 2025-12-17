# 🚀 LandSale.lk Production Deployment Guide

Your application is **Production Ready** from a code perspective. The core features, UI/UX enhancements, and security measures (like authenticated routes) are all implemented.

To successfully connect `landsale.lk` and go live, follow these specific steps:

## 1. Environment Configuration
When deploying to your hosting provider (Vercel, Netlify, VPS, etc.), you **MUST** set these environment variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://landsale.lk` | Used for SEO, OG images, and email redirects. |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | *(Your Appwrite Endpoint)* | API Endpoint. |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | *(Your Appwrite Project ID)* | Project Identifier. |
| `RESEND_API_KEY` | *(Your Resend API Key)* | Sending inquiry notifications. |
| `EMAIL_FROM` | `noreply@landsale.lk` | Sender address for emails. |

## 2. Appwrite Configuration (Critical)
Log in to your Appwrite Console and update these settings:

1.  Go to **Auth** > **Security**.
2.  Enable **Email/Password**, **Anonymous**, and **Google** (if using OAuth).
3.  Go to **Settings** > **Overview** of your project.
4.  Adding your production domain creates a platform automatically or you might need to add it manually under **Platforms** > **Add Platform** > **Web App**.
    - **Hostname**: `landsale.lk`

## 3. Domain & DNS Settings
1.  **Hosting Provider**: Add the custom domain `landsale.lk`.
2.  **DNS Provider (Registrar)**:
    - Add the **A Record** (for root domain `@`) provided by your host.
    - Add the **CNAME Record** (for `www`) if required.
3.  **Resend (Email)**:
    - Go to [Resend Domains](https://resend.com/domains).
    - Add `landsale.lk`.
    - Add the provided **MX** and **TXT** records to your DNS to verify sender identity.

## 4. Final Sanity Checks
- [ ] **robots.txt**: Automatically generated, but ensure your hosting doesn't block bots by default (e.g., Vercel's "Preview" environments block indexing).
- [ ] **Database**: Ensure your Appwrite database structure matches `APPWRITE_COLLECTIONS_REFERENCE.md`.
- [ ] **Storage**: Ensure your Appwrite Storage buckets (`properties`, `avatars`) have correct permissions (`role:all` for read access usually).

## 5. Troubleshooting Common Issues
- **404 on Refresh**: If hosting on a VPS/Nginx, ensure you configure it to route all requests to `index.html` (SPA fallback) or properly proxy to the Next.js server port. Vercel handles this automatically.
- **Images not loading**: Check `next.config.ts`. Ensure your Appwrite endpoint domain is added to `images.remotePatterns`.
- **Login Redirects to localhost**: You forgot to update OAuth redirect URLs in Appwrite Console.

## 🚀 You are ready for launch!
The application build is passing with 0 errors and all critical UI/UX issues from the audit have been resolved.
