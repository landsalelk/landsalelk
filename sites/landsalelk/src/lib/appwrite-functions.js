import { functions } from './appwrite';

const FUNCTION_CERTIFICATE = 'generate-certificate';
const FUNCTION_AGENT_ID = 'generate-agent-id';

/**
 * Generate PDF certificate using Appwrite Function
 * @param {Object} data - Certificate data
 * @returns {Promise<Object>} - Result with fileUrl
 */
export async function generateCertificateServer(data) {
    try {
        const execution = await functions.createExecution(
            FUNCTION_CERTIFICATE,
            JSON.stringify(data),
            false // async
        );

        if (execution.status === 'completed') {
            const response = JSON.parse(execution.responseBody);
            if (response.success) {
                return {
                    success: true,
                    fileUrl: response.fileUrl,
                    fileId: response.fileId,
                    certificateNumber: response.certificateNumber
                };
            }
            throw new Error(response.error || 'Certificate generation failed');
        }

        throw new Error(`Function execution failed: ${execution.status}`);
    } catch (error) {
        console.error('Certificate generation error:', error);
        throw error;
    }
}

/**
 * Generate Digital Agent ID using Appwrite Function
 * @param {Object} data - Agent data
 * @returns {Promise<Object>} - Result with fileUrl
 */
export async function generateDigitalIDServer(data) {
    try {
        const execution = await functions.createExecution(
            FUNCTION_AGENT_ID,
            JSON.stringify(data),
            false // async
        );

        if (execution.status === 'completed') {
            const response = JSON.parse(execution.responseBody);
            if (response.success) {
                return {
                    success: true,
                    fileUrl: response.fileUrl,
                    fileId: response.fileId
                };
            }
            throw new Error(response.error || 'ID generation failed');
        }

        throw new Error(`Function execution failed: ${execution.status}`);
    } catch (error) {
        console.error('Digital ID generation error:', error);
        throw error;
    }
}

/**
 * Get or generate certificate for agent
 * Falls back to client-side generation if server fails
 */
export async function getAgentCertificate(agentData) {
    try {
        // Try server-side first
        return await generateCertificateServer(agentData);
    } catch (error) {
        console.warn('Server-side certificate generation failed, using client-side fallback');
        // Import dynamically to avoid SSR issues
        const { downloadCertificatePDF, generateCertificateData } = await import('./certificate');
        const certData = generateCertificateData(agentData.agentName);
        downloadCertificatePDF(certData);
        return { success: true, fallback: true };
    }
}

/**
 * Get or generate Digital ID for agent
 * Falls back to client-side generation if server fails
 */
export async function getAgentDigitalID(agentData) {
    try {
        // Try server-side first
        return await generateDigitalIDServer(agentData);
    } catch (error) {
        console.warn('Server-side ID generation failed, using client-side fallback');
        return { success: false, error: error.message, fallback: true };
    }
}
