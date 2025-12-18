/**
 * OpenRouter API Load Test
 * Simulates 10 concurrent users hitting the AI chat endpoint
 * 
 * Run with: node tests/load/load-test.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const testMessages = [
    'What properties are available in Colombo?',
    'Tell me about land prices in Kandy',
    'How do I verify property documents?',
    'What is Sinnakkara deed?',
    'How can I get a home loan?',
    'Show me apartments for rent',
    'What are the legal requirements for buying land?',
    'Explain Bim Saviya registration',
    'What is the average price per perch in Galle?',
    'How do I contact a real estate agent?'
];

async function sendChatMessage(userId, message) {
    const startTime = Date.now();

    try {
        const response = await fetch(`${BASE_URL}/api/ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                context: {
                    page: '/',
                    propertyTitle: `Test User ${userId}`
                }
            })
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        const data = await response.json();

        return {
            userId,
            message,
            status: response.status,
            success: response.ok,
            duration,
            hasReply: !!data.reply,
            error: data.error || null
        };
    } catch (error) {
        const endTime = Date.now();
        return {
            userId,
            message,
            status: 0,
            success: false,
            duration: endTime - startTime,
            hasReply: false,
            error: error.message
        };
    }
}

async function runLoadTest(concurrentUsers = 10) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        OpenRouter API Load Test - LandSale.lk             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Starting load test with ${concurrentUsers} concurrent users...\n`);
    console.log(`📡 Target: ${BASE_URL}/api/ai\n`);

    const startTime = Date.now();

    // Create concurrent requests
    const promises = [];
    for (let i = 0; i < concurrentUsers; i++) {
        const message = testMessages[i % testMessages.length];
        promises.push(sendChatMessage(i + 1, message));
    }

    // Wait for all requests to complete
    const results = await Promise.all(promises);

    const totalTime = Date.now() - startTime;

    // Analyze results
    console.log('\n📊 RESULTS\n');
    console.log('─'.repeat(60));

    let successCount = 0;
    let failCount = 0;
    let totalDuration = 0;
    let durations = [];

    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} User ${result.userId.toString().padStart(2)}: ${result.duration}ms - ${result.success ? 'Success' : result.error}`);

        if (result.success) {
            successCount++;
        } else {
            failCount++;
        }

        totalDuration += result.duration;
        durations.push(result.duration);
    });

    // Calculate statistics
    durations.sort((a, b) => a - b);
    const avgDuration = totalDuration / results.length;
    const minDuration = durations[0];
    const maxDuration = durations[durations.length - 1];
    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];

    console.log('\n' + '─'.repeat(60));
    console.log('\n📈 SUMMARY\n');

    console.log(`Total Requests:     ${results.length}`);
    console.log(`Successful:         ${successCount} (${((successCount / results.length) * 100).toFixed(1)}%)`);
    console.log(`Failed:             ${failCount} (${((failCount / results.length) * 100).toFixed(1)}%)`);
    console.log(`Total Time:         ${totalTime}ms`);
    console.log(`Requests/Second:    ${(results.length / (totalTime / 1000)).toFixed(2)}`);

    console.log('\n⏱️  LATENCY\n');
    console.log(`Average:            ${avgDuration.toFixed(0)}ms`);
    console.log(`Min:                ${minDuration}ms`);
    console.log(`Max:                ${maxDuration}ms`);
    console.log(`P50 (Median):       ${p50}ms`);
    console.log(`P95:                ${p95}ms`);
    console.log(`P99:                ${p99}ms`);

    // Return summary for programmatic use
    return {
        totalRequests: results.length,
        successCount,
        failCount,
        successRate: (successCount / results.length) * 100,
        avgDuration,
        minDuration,
        maxDuration,
        p50,
        p95,
        p99,
        totalTime,
        requestsPerSecond: results.length / (totalTime / 1000)
    };
}

// Run the test
runLoadTest(10)
    .then(summary => {
        console.log('\n' + '═'.repeat(60));

        if (summary.successRate >= 90) {
            console.log('\n✅ PASS: API handles 10 concurrent users successfully!\n');
            process.exit(0);
        } else if (summary.successRate >= 50) {
            console.log('\n⚠️  WARNING: Some requests failed. Check API configuration.\n');
            process.exit(0);
        } else {
            console.log('\n❌ FAIL: API cannot handle concurrent load.\n');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Load test error:', error.message);
        console.log('\n💡 Make sure the dev server is running: npm run dev\n');
        process.exit(1);
    });
