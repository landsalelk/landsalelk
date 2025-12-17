#!/bin/sh

# Coolify Docker Deployment Script
# This script builds and deploys your Next.js app to Coolify

echo "🚀 Starting Coolify Docker Deployment..."

# Set environment variables for build
export NEXT_PUBLIC_APPWRITE_ENDPOINT=http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1
export NEXT_PUBLIC_APPWRITE_PROJECT_ID=693962bb002fb1f881bd
export NEXT_PUBLIC_GOOGLE_CLIENT_ID=937216007837-3ceut2kl020gt9gbqh8ugbfejs5ukg6d.apps.googleusercontent.com
export NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAttPi1U7lXiOoZgP_0rRoiciHsO3sPYfkAIzaSyAttPi1U7lXiOoZgP_0rRoiciHsO3sPYfk
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Run the build
echo "🔨 Running Next.js build..."
npm run build

echo "✅ Build completed successfully!"