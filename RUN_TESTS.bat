#!/bin/bash
# Comprehensive Test Suite for Landsale.lk

echo "🧪 STARTING COMPREHENSIVE TEST SUITE"
echo "==================================="

# Start the development server in background
echo "🚀 Starting development server..."
npx next dev -p 3001 > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to initialize..."
sleep 15

# Check if server is running
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running successfully!"
else
    echo "❌ Server failed to start"
    cat server.log
    exit 1
fi

echo ""
echo "📋 RUNNING PLAYWRIGHT TESTS"
echo "==========================="

# Run Playwright tests with detailed reporting
npx playwright test \
    --reporter=html,list \
    tests/e2e/notification-bell.spec.ts \
    tests/e2e/image-safety.spec.ts \
    tests/e2e/appwrite-error-handling.spec.ts \
    tests/e2e/auth.spec.ts \
    tests/e2e/property.spec.ts

TEST_EXIT_CODE=$?

echo ""
echo "📊 TEST RESULTS"
echo "==============="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
else
    echo "❌ SOME TESTS FAILED"
fi

# Stop the server
echo "🛑 Stopping server..."
kill $SERVER_PID

echo ""
echo "🏁 TEST SUITE COMPLETED"
echo "======================="

exit $TEST_EXIT_CODE