# LandSale.lk - Linux Deployment Guide

This archive contains the source code for the LandSale.lk frontend application, ready for deployment on a Linux server (Ubuntu/Debian/CentOS).

## Prerequisites
- Node.js 18.17 or later
- NPM or Yarn or PNPM
- An Appwrite project (Endpoint & Project ID)

## Installation Steps

1. **Unzip the project**
   ```bash
   unzip landsale-linux-ready.zip
   cd landsale-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**
   The archive might contain a `.env.local` file. For production, rename it or ensure variables are set in your OS/Deployment tool.
   ```bash
   cp .env.local .env.production
   ```
   
   **Critical Variables:**
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite Endpoint
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite Project ID
   - `APPWRITE_API_KEY`: (Optional) Server-side API Key for admin tasks
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g., https://landsale.lk)

4. **Build the Application**
   ```bash
   npm run build
   ```

5. **Start Production Server**
   ```bash
   npm start
   # Runs on port 3000 by default. Set PORT=3005 npm start to change port.
   ```

## Using PM2 (Recommended for Production)
To keep the app running in the background:
```bash
npm install -g pm2
pm2 start npm --name "landsale-frontend" -- start
pm2 save
```

## Troubleshooting
- **Missing Images:** Ensure `NEXT_PUBLIC_APPWRITE_ENDPOINT` is correct and buckets have read permissions.
- **404 Errors:** Ensure `NEXT_PUBLIC_SITE_URL` is set correctly for redirects.
