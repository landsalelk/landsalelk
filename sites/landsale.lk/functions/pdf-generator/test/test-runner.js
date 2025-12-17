import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * Test runner for PDF Generator Function
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.startTime = Date.now();
    }

    /**
     * Register a test
     */
    test(name, fn, options = {}) {
        this.tests.push({
            name,
            fn,
            timeout: options.timeout || 30000,
            skip: options.skip || false,
            only: options.only || false
        });
    }

    /**
     * Run all tests
     */
    async run() {
        console.log('🧪 PDF Generator Test Suite');
        console.log('============================');
        console.log('');

        // Filter tests
        const onlyTests = this.tests.filter(t => t.only);
        const testsToRun = onlyTests.length > 0 ? onlyTests : this.tests.filter(t => !t.skip);

        console.log(`Running ${testsToRun.length} tests...`);
        console.log('');

        for (const test of testsToRun) {
            await this.runTest(test);
        }

        this.printResults();
        return this.results.failed === 0;
    }

    /**
     * Run a single test
     */
    async runTest(test) {
        this.results.total++;
        const testStart = Date.now();

        try {
            console.log(`▶️  ${test.name}`);
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Test timeout after ${test.timeout}ms`)), test.timeout);
            });

            await Promise.race([test.fn(), timeoutPromise]);
            
            const duration = Date.now() - testStart;
            console.log(`✅ ${test.name} (${duration}ms)`);
            this.results.passed++;
            
        } catch (error) {
            const duration = Date.now() - testStart;
            console.log(`❌ ${test.name} (${duration}ms)`);
            console.log(`   Error: ${error.message}`);
            
            this.results.failed++;
            this.results.errors.push({
                test: test.name,
                error: error.message,
                stack: error.stack
            });
        }
        
        console.log('');
    }

    /**
     * Print test results
     */
    printResults() {
        const duration = Date.now() - this.startTime;
        
        console.log('📊 Test Results');
        console.log('===============');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Skipped: ${this.results.skipped}`);
        console.log(`Duration: ${duration}ms`);
        console.log('');

        if (this.results.errors.length > 0) {
            console.log('❌ Errors:');
            this.results.errors.forEach(({ test, error }) => {
                console.log(`  - ${test}: ${error}`);
            });
            console.log('');
        }

        if (this.results.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('💥 Some tests failed!');
        }
    }

    /**
     * Assert utilities
     */
    static assert = {
        equal(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(message || `Expected ${expected}, got ${actual}`);
            }
        },

        notEqual(actual, expected, message) {
            if (actual === expected) {
                throw new Error(message || `Expected not ${expected}, got ${actual}`);
            }
        },

        ok(value, message) {
            if (!value) {
                throw new Error(message || 'Expected truthy value');
            }
        },

        notOk(value, message) {
            if (value) {
                throw new Error(message || 'Expected falsy value');
            }
        },

        includes(collection, item, message) {
            if (!collection.includes(item)) {
                throw new Error(message || `Expected ${collection} to include ${item}`);
            }
        },

        async throws(fn, message) {
            let error;
            try {
                await fn();
            } catch (e) {
                error = e;
            }
            
            if (!error) {
                throw new Error(message || 'Expected function to throw');
            }
            
            return error;
        },

        async notThrows(fn, message) {
            try {
                await fn();
            } catch (e) {
                throw new Error(message || `Expected function not to throw: ${e.message}`);
            }
        }
    };
}

// Export for use in other test files
export default TestRunner;