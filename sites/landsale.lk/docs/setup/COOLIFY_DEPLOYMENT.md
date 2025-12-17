# Coolify Deployment Configuration

## Environment Variables Required
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=693962bb002fb1f881bd
NEXT_PUBLIC_GOOGLE_CLIENT_ID=937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

## Build Configuration
- Build Command: `npm run build`
- Start Command: `npm start`
- Port: `3000`
- Health Check: `/` (root path)

## Docker Configuration
- Uses multi-stage build with Node.js 20 Alpine
- Optimized for production
- Includes all necessary dependencies

## Deployment Steps
1. Connect Git repository to Coolify
2. Set environment variables
3. Configure build settings
4. Deploy application
5. Configure custom domain (optional)