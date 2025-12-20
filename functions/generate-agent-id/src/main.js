import { Client, Databases, Storage, ID } from 'node-appwrite';
import * as PImage from 'pureimage';
import QRCode from 'qrcode';
import { Readable, PassThrough } from 'stream';
import path from 'path';

// Environment variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID || '6756bee0000c6c787b9f';
const BUCKET_AGENT_IDS = process.env.BUCKET_AGENT_IDS || 'agent-ids';
const COLLECTION_AGENTS = process.env.COLLECTION_AGENTS || 'agents';

// Load fonts
try {
    const fontRegular = PImage.registerFont(path.join(process.cwd(), 'assets', 'OpenSans-Regular.ttf'), 'Open Sans');
    const fontBold = PImage.registerFont(path.join(process.cwd(), 'assets', 'OpenSans-Bold.ttf'), 'Open Sans', 700, 'bold');

    fontRegular.loadSync();
    fontBold.loadSync();
} catch (e) {
    console.warn('Failed to load fonts:', e);
}

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const storage = new Storage(client);

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { agentId, agentName, location, specialization, isVerified, certifiedAt } = body;

        if (!agentId || !agentName) {
            return res.json({ success: false, error: 'Missing required fields' }, 400);
        }

        log(`Generating Digital ID for: ${agentName} (${agentId})`);

        // Generate QR code as Buffer
        const verificationUrl = `https://landsale.lk/verify/agent/${agentId}`;
        const qrBuffer = await QRCode.toBuffer(verificationUrl, {
            width: 80,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' }
        });

        // Decode QR buffer to image
        const qrStream = Readable.from(qrBuffer);
        const qrImage = await PImage.decodePNGFromStream(qrStream);

        // Create canvas for ID card
        const cardWidth = 500;
        const cardHeight = 300;
        const canvas = PImage.make(cardWidth, cardHeight);
        const ctx = canvas.getContext('2d');

        // Background (Solid color fallback for gradient)
        ctx.fillStyle = '#0f172a'; // Base color of the gradient
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Decorative circles (background effect)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.beginPath();
        ctx.arc(cardWidth + 50, -50, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-50, cardHeight + 50, 150, 0, Math.PI * 2);
        ctx.fill();

        // Bottom bar (Solid color fallback)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, cardHeight - 4, cardWidth, 4);

        // Logo area (Solid color fallback)
        ctx.fillStyle = '#14b8a6';
        roundRect(ctx, 30, 30, 50, 50, 12);
        ctx.fill();

        // Shield icon (simplified)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(55, 42);
        ctx.lineTo(55, 58);
        ctx.quadraticCurveTo(55, 68, 45, 72);
        ctx.quadraticCurveTo(35, 68, 35, 58);
        ctx.lineTo(35, 42);
        ctx.lineTo(55, 42);
        ctx.fill();

        // Company name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16pt "Open Sans"'; // pureimage uses pt sizes often
        ctx.fillText('LANDSALE.LK', 95, 52);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12pt "Open Sans"';
        ctx.fillText('Certified Agent', 95, 70);

        // Verified badge
        if (isVerified) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            roundRect(ctx, cardWidth - 120, 35, 90, 26, 13);
            ctx.fill();

            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.lineWidth = 1;
            // roundRect path needs to be redrawn for stroke
            roundRect(ctx, cardWidth - 120, 35, 90, 26, 13);
            ctx.stroke();

            // Checkmark
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(cardWidth - 105, 48, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cardWidth - 108, 48);
            ctx.lineTo(cardWidth - 105, 51);
            ctx.lineTo(cardWidth - 101, 45);
            ctx.stroke();

            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 10pt "Open Sans"';
            ctx.fillText('VERIFIED', cardWidth - 92, 52);
        }

        // Agent avatar placeholder (Solid color fallback)
        ctx.fillStyle = '#334155';
        roundRect(ctx, 30, 110, 70, 70, 16);
        ctx.fill();

        // Initial
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32pt "Open Sans"';
        const initial = agentName.charAt(0).toUpperCase();
        const textMetrics = ctx.measureText(initial);
        const textWidth = textMetrics.width || 20;
        ctx.fillText(initial, 65 - textWidth / 2, 155);

        // Agent name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22pt "Open Sans"';
        ctx.fillText(agentName, 115, 140);

        // Specialization
        if (specialization) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13pt "Open Sans"';
            ctx.fillText(specialization, 115, 160);
        }

        // Location
        if (location) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12pt "Open Sans"';
            ctx.fillText(`📍 ${location}`, 115, 180);
        }

        // Agent ID
        ctx.fillStyle = '#64748b';
        ctx.font = '9pt "Open Sans"';
        ctx.fillText('AGENT ID', 30, 210);
        ctx.fillStyle = '#ffffff';
        ctx.font = '13pt "Open Sans"'; // Monospace might fall back to Open Sans
        ctx.fillText(agentId.slice(0, 12).toUpperCase(), 30, 228);

        // Certified date
        if (certifiedAt) {
            ctx.fillStyle = '#64748b';
            ctx.font = '9pt "Open Sans"';
            ctx.fillText('CERTIFIED', 30, 255);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12pt "Open Sans"';
            ctx.fillText(new Date(certifiedAt).getFullYear().toString(), 30, 273);
        }

        // QR Code
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, cardWidth - 130, 110, 100, 100, 16);
        ctx.fill();
        ctx.drawImage(qrImage, cardWidth - 120, 120, 80, 80);

        ctx.fillStyle = '#64748b';
        ctx.font = '8pt "Open Sans"';
        ctx.fillText('SCAN TO VERIFY', cardWidth - 110, 215);

        // Convert to buffer
        const passThrough = new PassThrough();
        const chunks = [];

        const bufferPromise = new Promise((resolve, reject) => {
            passThrough.on('data', (chunk) => chunks.push(chunk));
            passThrough.on('end', () => resolve(Buffer.concat(chunks)));
            passThrough.on('error', reject);
        });

        await PImage.encodePNGToStream(canvas, passThrough);
        const buffer = await bufferPromise;

        // Upload to Appwrite Storage
        const fileId = ID.unique();
        const fileName = `agent_id_${agentId}_${Date.now()}.png`;

        const file = await storage.createFile(
            BUCKET_AGENT_IDS,
            fileId,
            new File([buffer], fileName, { type: 'image/png' })
        );

        const fileUrl = `${process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1'}/storage/buckets/${BUCKET_AGENT_IDS}/files/${fileId}/view?project=${PROJECT_ID}`;

        // Update agent record
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_AGENTS, agentId, {
                digital_id_url: fileUrl,
                digital_id_file_id: fileId
            });
        } catch (e) {
            log(`Could not update agent record: ${e.message}`);
        }

        log(`Digital ID generated successfully: ${fileId}`);

        return res.json({
            success: true,
            fileId,
            fileUrl,
            fileName
        });

    } catch (e) {
        error(`Digital ID generation failed: ${e.message}`);
        error(e.stack);
        return res.json({ success: false, error: e.message }, 500);
    }
};

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
