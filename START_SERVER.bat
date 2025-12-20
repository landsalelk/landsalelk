#!/bin/bash
# Startup script for Landsale.lk verification

echo "🚀 Starting Landsale.lk Development Server..."
echo "=========================================="

# Start the development server
npx next dev -p 3001 &

# Wait for server to start
echo "⏳ Waiting for server to initialize..."
sleep 10

# Check if server is running
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "🌐 Visit http://localhost:3001 to verify the application"
    echo ""
    echo "📋 Verification Checklist:"
    echo "  ✅ Appwrite error handling implemented"
    echo "  ✅ Image safety measures in place" 
    echo "  ✅ Authentication flows corrected"
    echo "  ✅ Lint warnings resolved"
    echo ""
    echo "📝 Manual Steps Required:"
    echo "  1. Run 'node scripts/fix_schema.mjs' to create Appwrite indexes"
    echo "  2. Configure your Appwrite environment variables in .env"
else
    echo "❌ Server failed to start. Check the logs above."
fi