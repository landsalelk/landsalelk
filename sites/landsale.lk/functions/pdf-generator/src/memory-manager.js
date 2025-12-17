import { EventEmitter } from 'events';

/**
 * Memory Management System for PDF Generation
 * Handles browser pooling, resource cleanup, and performance optimization
 */
export class PDFMemoryManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.maxConcurrentJobs = options.maxConcurrentJobs || 3;
        this.maxMemoryUsageMB = options.maxMemoryUsageMB || 512;
        this.cleanupInterval = options.cleanupInterval || 30000; // 30 seconds
        this.jobTimeout = options.jobTimeout || 60000; // 60 seconds
        
        this.activeJobs = new Map();
        this.browserPool = [];
        this.waitingQueue = [];
        this.totalMemoryUsage = 0;
        this.jobCounter = 0;
        
        this.startCleanupTimer();
    }

    /**
     * Process a PDF generation job with memory management
     */
    async processJob(jobFunction, jobData) {
        const jobId = `job_${++this.jobCounter}`;
        const jobStartTime = Date.now();
        
        try {
            // Check if we can start the job immediately
            if (this.canStartJob()) {
                return await this.executeJob(jobId, jobFunction, jobData);
            } else {
                // Add to waiting queue
                return await this.queueJob(jobId, jobFunction, jobData);
            }
        } catch (error) {
            this.emit('jobError', { jobId, error, duration: Date.now() - jobStartTime });
            throw error;
        }
    }

    /**
     * Check if a new job can be started
     */
    canStartJob() {
        return this.activeJobs.size < this.maxConcurrentJobs && 
               this.totalMemoryUsage < this.maxMemoryUsageMB * 1024 * 1024;
    }

    /**
     * Execute a job immediately
     */
    async executeJob(jobId, jobFunction, jobData) {
        const jobStartTime = Date.now();
        
        // Estimate memory usage
        const estimatedMemory = this.estimateMemoryUsage(jobData);
        
        // Create job tracking object
        const job = {
            id: jobId,
            startTime: jobStartTime,
            estimatedMemory,
            timeout: setTimeout(() => {
                this.timeoutJob(jobId);
            }, this.jobTimeout)
        };
        
        this.activeJobs.set(jobId, job);
        this.totalMemoryUsage += estimatedMemory;
        
        this.emit('jobStarted', { jobId, estimatedMemory });
        
        try {
            // Get browser instance from pool
            const browser = await this.getBrowserInstance();
            
            // Execute the job
            const result = await jobFunction(browser, jobData);
            
            // Return browser to pool
            this.returnBrowserInstance(browser);
            
            // Clean up job
            this.cleanupJob(jobId);
            
            const duration = Date.now() - jobStartTime;
            this.emit('jobCompleted', { jobId, duration, resultSize: result ? result.length : 0 });
            
            return result;
            
        } catch (error) {
            this.cleanupJob(jobId);
            throw error;
        }
    }

    /**
     * Queue a job for later execution
     */
    async queueJob(jobId, jobFunction, jobData) {
        return new Promise((resolve, reject) => {
            const queueItem = {
                jobId,
                jobFunction,
                jobData,
                resolve,
                reject,
                queuedAt: Date.now()
            };
            
            this.waitingQueue.push(queueItem);
            this.emit('jobQueued', { jobId, queuePosition: this.waitingQueue.length });
            
            // Try to process queue immediately
            this.processQueue();
        });
    }

    /**
     * Process waiting queue
     */
    async processQueue() {
        while (this.waitingQueue.length > 0 && this.canStartJob()) {
            const queueItem = this.waitingQueue.shift();
            
            try {
                const result = await this.executeJob(
                    queueItem.jobId,
                    queueItem.jobFunction,
                    queueItem.jobData
                );
                queueItem.resolve(result);
            } catch (error) {
                queueItem.reject(error);
            }
        }
    }

    /**
     * Get a browser instance from the pool
     */
    async getBrowserInstance() {
        // Try to reuse existing browser
        if (this.browserPool.length > 0) {
            const browser = this.browserPool.pop();
            if (await this.isBrowserHealthy(browser)) {
                return browser;
            } else {
                await this.closeBrowser(browser);
            }
        }
        
        // Create new browser instance
        return await this.createBrowserInstance();
    }

    /**
     * Return browser instance to pool
     */
    returnBrowserInstance(browser) {
        if (this.browserPool.length < this.maxConcurrentJobs) {
            this.browserPool.push(browser);
        } else {
            // Pool is full, close the browser
            this.closeBrowser(browser);
        }
    }

    /**
     * Create a new browser instance
     */
    async createBrowserInstance() {
        const puppeteer = await import('puppeteer');
        
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            dumpio: false
        });
        
        return browser;
    }

    /**
     * Check if browser instance is healthy
     */
    async isBrowserHealthy(browser) {
        try {
            const pages = await browser.pages();
            return pages.length < 10; // Max 10 pages per browser
        } catch (error) {
            return false;
        }
    }

    /**
     * Close browser instance
     */
    async closeBrowser(browser) {
        try {
            await browser.close();
        } catch (error) {
            // Ignore close errors
        }
    }

    /**
     * Clean up a completed job
     */
    cleanupJob(jobId) {
        const job = this.activeJobs.get(jobId);
        if (job) {
            // Clear timeout
            if (job.timeout) {
                clearTimeout(job.timeout);
            }
            
            // Update memory usage
            this.totalMemoryUsage -= job.estimatedMemory;
            if (this.totalMemoryUsage < 0) {
                this.totalMemoryUsage = 0;
            }
            
            // Remove from active jobs
            this.activeJobs.delete(jobId);
            
            this.emit('jobCleaned', { jobId });
            
            // Process waiting queue
            this.processQueue();
        }
    }

    /**
     * Handle job timeout
     */
    timeoutJob(jobId) {
        const job = this.activeJobs.get(jobId);
        if (job) {
            this.cleanupJob(jobId);
            this.emit('jobTimeout', { jobId, timeout: this.jobTimeout });
        }
    }

    /**
     * Estimate memory usage for job data
     */
    estimateMemoryUsage(jobData) {
        const contentSize = JSON.stringify(jobData).length;
        const baseMemory = 50 * 1024 * 1024; // 50MB base for browser
        const contentMemory = contentSize * 2; // Rough estimate
        return baseMemory + contentMemory;
    }

    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.performPeriodicCleanup();
        }, this.cleanupInterval);
    }

    /**
     * Perform periodic cleanup
     */
    async performPeriodicCleanup() {
        try {
            // Clean up idle browsers
            const maxIdleBrowsers = Math.max(1, Math.floor(this.maxConcurrentJobs / 2));
            
            while (this.browserPool.length > maxIdleBrowsers) {
                const browser = this.browserPool.pop();
                await this.closeBrowser(browser);
            }
            
            // Force cleanup of stuck jobs
            const now = Date.now();
            for (const [jobId, job] of this.activeJobs) {
                if (now - job.startTime > this.jobTimeout * 2) {
                    this.cleanupJob(jobId);
                }
            }
            
            this.emit('cleanupPerformed', { 
                activeJobs: this.activeJobs.size,
                waitingQueue: this.waitingQueue.length,
                browserPool: this.browserPool.length,
                memoryUsage: this.totalMemoryUsage
            });
            
        } catch (error) {
            this.emit('cleanupError', { error });
        }
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            activeJobs: this.activeJobs.size,
            waitingQueue: this.waitingQueue.length,
            browserPool: this.browserPool.length,
            totalMemoryUsage: this.totalMemoryUsage,
            maxConcurrentJobs: this.maxConcurrentJobs,
            maxMemoryUsageMB: this.maxMemoryUsageMB
        };
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        // Wait for active jobs to complete
        const activeJobPromises = Array.from(this.activeJobs.keys()).map(jobId => {
            return new Promise(resolve => {
                this.once('jobCleaned', (data) => {
                    if (data.jobId === jobId) {
                        resolve();
                    }
                });
            });
        });
        
        // Give jobs 30 seconds to complete
        await Promise.race([
            Promise.all(activeJobPromises),
            new Promise(resolve => setTimeout(resolve, 30000))
        ]);
        
        // Close all browsers
        await Promise.all(this.browserPool.map(browser => this.closeBrowser(browser)));
        this.browserPool = [];
        
        this.emit('shutdownComplete');
    }
}

/**
 * Global memory manager instance
 */
let globalMemoryManager = null;

/**
 * Get or create global memory manager
 */
export function getMemoryManager(options = {}) {
    if (!globalMemoryManager) {
        globalMemoryManager = new PDFMemoryManager(options);
    }
    return globalMemoryManager;
}

/**
 * Process PDF generation with memory management
 */
export async function processWithMemoryManagement(jobFunction, jobData, options = {}) {
    const memoryManager = getMemoryManager(options);
    return await memoryManager.processJob(jobFunction, jobData);
}