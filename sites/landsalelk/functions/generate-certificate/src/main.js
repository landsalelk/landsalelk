import { Client, Databases, Storage, ID } from 'node-appwrite';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

// Environment variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID || '6756bee0000c6c787b9f';
const BUCKET_CERTIFICATES = process.env.BUCKET_CERTIFICATES || 'certificates';
const COLLECTION_AGENTS = process.env.COLLECTION_AGENTS || 'agents';

export default async ({ req, res, log, error }) => {
    // Setup Appwrite client
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const storage = new Storage(client);

    try {
        // Parse request
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { agentId, agentName, completionDate, certificateNumber, modulesCompleted, totalModules, badges, totalTimeSpent } = body;

        if (!agentId || !agentName) {
            return res.json({ success: false, error: 'Missing required fields: agentId and agentName' }, 400);
        }

        log(`Generating certificate for agent: ${agentName} (${agentId})`);

        // Generate verification URL and QR code
        const verificationUrl = `https://landsale.lk/verify/certificate/${certificateNumber || agentId}`;
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
            width: 100,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' }
        });

        // Create PDF
        const pdfBuffer = await generateCertificatePDF({
            agentName,
            completionDate: completionDate || new Date().toLocaleDateString('en-LK', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            certificateNumber: certificateNumber || `LSL-${Date.now().toString(36).toUpperCase()}`,
            modulesCompleted: modulesCompleted || 10,
            totalModules: totalModules || 10,
            badges: badges || [],
            totalTimeSpent: totalTimeSpent || 0,
            qrDataUrl,
            verificationUrl
        });

        // Upload to Appwrite Storage
        const fileId = ID.unique();
        const fileName = `certificate_${agentId}_${Date.now()}.pdf`;

        const file = await storage.createFile(
            BUCKET_CERTIFICATES,
            fileId,
            new File([pdfBuffer], fileName, { type: 'application/pdf' })
        );

        // Get download URL
        const fileUrl = `${process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}/storage/buckets/${BUCKET_CERTIFICATES}/files/${fileId}/view?project=${PROJECT_ID}`;

        // Update agent record with certificate info
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_AGENTS, agentId, {
                certificate_url: fileUrl,
                certificate_file_id: fileId,
                certified_at: new Date().toISOString()
            });
        } catch (e) {
            log(`Could not update agent record: ${e.message}`);
        }

        log(`Certificate generated successfully: ${fileId}`);

        return res.json({
            success: true,
            fileId,
            fileUrl,
            fileName,
            certificateNumber: certificateNumber || `LSL-${Date.now().toString(36).toUpperCase()}`
        });

    } catch (e) {
        error(`Certificate generation failed: ${e.message}`);
        return res.json({ success: false, error: e.message }, 500);
    }
};

/**
 * Generate PDF certificate using PDFKit
 */
async function generateCertificatePDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const width = doc.page.width;
            const height = doc.page.height;

            // Background gradient effect (using rectangles)
            doc.rect(0, 0, width, height).fill('#f8fafc');

            // Top decorative bar
            doc.rect(0, 0, width, 8).fill('#10b981');

            // Border
            doc.rect(20, 20, width - 40, height - 40)
                .lineWidth(2)
                .stroke('#e2e8f0');

            // Inner border
            doc.rect(30, 30, width - 60, height - 60)
                .lineWidth(1)
                .stroke('#10b981');

            // Header
            doc.fontSize(14)
                .fillColor('#10b981')
                .font('Helvetica-Bold')
                .text('LANDSALE.LK', 0, 60, { align: 'center' });

            doc.fontSize(10)
                .fillColor('#64748b')
                .font('Helvetica')
                .text("Sri Lanka's Premier Property Platform", 0, 80, { align: 'center' });

            // Certificate title
            doc.fontSize(36)
                .fillColor('#0f172a')
                .font('Helvetica-Bold')
                .text('Certificate of Completion', 0, 120, { align: 'center' });

            // Subtitle
            doc.fontSize(14)
                .fillColor('#64748b')
                .font('Helvetica')
                .text('Agent Training Academy', 0, 165, { align: 'center' });

            // Decorative line
            doc.moveTo(width / 2 - 100, 195)
                .lineTo(width / 2 + 100, 195)
                .lineWidth(2)
                .stroke('#10b981');

            // "This certifies that"
            doc.fontSize(12)
                .fillColor('#64748b')
                .font('Helvetica')
                .text('This is to certify that', 0, 220, { align: 'center' });

            // Agent name
            doc.fontSize(28)
                .fillColor('#0f172a')
                .font('Helvetica-Bold')
                .text(data.agentName, 0, 245, { align: 'center' });

            // Completion text
            doc.fontSize(12)
                .fillColor('#64748b')
                .font('Helvetica')
                .text('has successfully completed all required training modules', 0, 285, { align: 'center' })
                .text('and is hereby recognized as a', 0, 302, { align: 'center' });

            // Certified Agent title
            doc.fontSize(20)
                .fillColor('#10b981')
                .font('Helvetica-Bold')
                .text('Certified Property Agent', 0, 325, { align: 'center' });

            // Stats row
            const statsY = 365;
            const statsSpacing = 150;
            const statsX = width / 2 - statsSpacing;

            // Modules completed
            doc.fontSize(20)
                .fillColor('#0f172a')
                .font('Helvetica-Bold')
                .text(`${data.modulesCompleted}/${data.totalModules}`, statsX - 30, statsY, { width: 100, align: 'center' });
            doc.fontSize(9)
                .fillColor('#64748b')
                .font('Helvetica')
                .text('Modules', statsX - 30, statsY + 25, { width: 100, align: 'center' });

            // Time spent
            const hours = Math.floor(data.totalTimeSpent / 60);
            const mins = data.totalTimeSpent % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            doc.fontSize(20)
                .fillColor('#0f172a')
                .font('Helvetica-Bold')
                .text(timeStr, statsX + statsSpacing - 30, statsY, { width: 100, align: 'center' });
            doc.fontSize(9)
                .fillColor('#64748b')
                .font('Helvetica')
                .text('Training Time', statsX + statsSpacing - 30, statsY + 25, { width: 100, align: 'center' });

            // Date
            doc.fontSize(11)
                .fillColor('#64748b')
                .font('Helvetica')
                .text(`Issued on ${data.completionDate}`, 0, 420, { align: 'center' });

            // Certificate number
            doc.fontSize(9)
                .fillColor('#94a3b8')
                .font('Helvetica')
                .text(`Certificate No: ${data.certificateNumber}`, 0, 440, { align: 'center' });

            // QR Code (as base64 image) - bottom right
            if (data.qrDataUrl) {
                const qrImg = data.qrDataUrl.replace(/^data:image\/png;base64,/, '');
                doc.image(Buffer.from(qrImg, 'base64'), width - 130, height - 130, {
                    width: 80,
                    height: 80
                });
                doc.fontSize(7)
                    .fillColor('#94a3b8')
                    .text('Scan to verify', width - 130, height - 45, { width: 80, align: 'center' });
            }

            // Footer
            doc.fontSize(8)
                .fillColor('#94a3b8')
                .font('Helvetica')
                .text('This certificate verifies completion of the LandSale.lk Agent Training Academy.', 50, height - 50, { width: width - 100, align: 'center' })
                .text(`Verify at: ${data.verificationUrl}`, 50, height - 38, { width: width - 100, align: 'center' });

            // Bottom decorative bar
            doc.rect(0, height - 8, width, 8).fill('#10b981');

            doc.end();
        } catch (e) {
            reject(e);
        }
    });
}
