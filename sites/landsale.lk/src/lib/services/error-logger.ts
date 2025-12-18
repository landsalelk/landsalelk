import { APPWRITE_CONFIG } from '@/lib/appwrite/config'
import { Client, Databases, ID } from 'appwrite'
import { createGitHubIssue } from '@/lib/actions/error-logging'

interface ErrorLogPayload {
    message: string
    stack?: string
    component_stack?: string
    url?: string
    user_agent?: string
    user_id?: string
    timestamp: string
    environment?: string
}

class ErrorLoggerService {
    private client: Client
    private databases: Databases

    constructor() {
        this.client = new Client()

        if (APPWRITE_CONFIG.endpoint) {
            this.client.setEndpoint(APPWRITE_CONFIG.endpoint)
        }

        if (APPWRITE_CONFIG.projectId) {
            this.client.setProject(APPWRITE_CONFIG.projectId)
        }

        this.databases = new Databases(this.client)
    }

    /**
     * Log an error to Appwrite and optionally to GitHub Issues
     */
    async logError(error: Error, componentStack?: string) {
        const isDev = process.env.NODE_ENV === 'development'

        const payload: ErrorLogPayload = {
            message: error.message || 'Unknown Error',
            stack: error.stack,
            component_stack: componentStack,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        }

        if (isDev) {
             console.log('[ErrorLogger] Would log to Appwrite:', payload)
        }

        // 1. Log to Appwrite (Fire and forget)
        this.sendToAppwrite(payload).catch(err =>
            console.error('[ErrorLogger] Failed to log to Appwrite:', err)
        )

        // 2. Create GitHub Issue (Server Action)
        // Only valid if we are not in strict dev mode (or we can enable it for dev too if desired)
        if (!isDev || true) { // Enabled for now to verify
             this.sendToGitHub(payload).catch(err =>
                 console.error('[ErrorLogger] Failed to create GitHub issue:', err)
             )
        }
    }

    private async sendToAppwrite(payload: ErrorLogPayload) {
        try {
            await this.databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.SYSTEM_ERRORS,
                ID.unique(),
                payload as unknown as object
            )
        } catch (err) {
            console.error('[ErrorLogger] Appwrite logging error:', err)
            throw err
        }
    }

    private async sendToGitHub(payload: ErrorLogPayload) {
        const title = `[Auto-Report] ${payload.message.substring(0, 100)}`
        const body = `
**Error Message**: ${payload.message}
**Timestamp**: ${payload.timestamp}
**Environment**: ${payload.environment}
**URL**: ${payload.url}
**User Agent**: ${payload.user_agent}

### Stack Trace
\`\`\`
${payload.stack}
\`\`\`

### Component Stack
\`\`\`
${payload.component_stack || 'N/A'}
\`\`\`
`
        await createGitHubIssue({ title, body })
    }
}

export const errorLogger = new ErrorLoggerService()
