import { Client, Databases, Storage, ID } from 'node-appwrite';
import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';

// Environment variables
const PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID || '6756bee0000c6c787b9f';
const BUCKET_AGENT_IDS = process.env.BUCKET_AGENT_IDS || 'agent-ids';
const COLLECTION_AGENTS = process.env.COLLECTION_AGENTS || 'agents';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
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

        // Generate QR code
        const verificationUrl = `https://landsale.lk/verify/agent/${agentId}`;
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
            width: 120,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' }
        });

        // Create canvas for ID card
        const cardWidth = 500;
        const cardHeight = 300;
        const canvas = createCanvas(cardWidth, cardHeight);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Decorative circles (background effect)
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(cardWidth + 50, -50, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-50, cardHeight + 50, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Bottom gradient bar
        const barGradient = ctx.createLinearGradient(0, cardHeight - 4, cardWidth, cardHeight - 4);
        barGradient.addColorStop(0, '#10b981');
        barGradient.addColorStop(0.5, '#14b8a6');
        barGradient.addColorStop(1, '#10b981');
        ctx.fillStyle = barGradient;
        ctx.fillRect(0, cardHeight - 4, cardWidth, 4);

        // Logo area
        const logoGradient = ctx.createLinearGradient(30, 30, 70, 70);
        logoGradient.addColorStop(0, '#34d399');
        logoGradient.addColorStop(1, '#14b8a6');
        ctx.fillStyle = logoGradient;
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
        ctx.font = 'bold 16px Arial';
        ctx.fillText('LANDSALE.LK', 95, 52);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.fillText('Certified Agent', 95, 70);

        // Verified badge
        if (isVerified) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            roundRect(ctx, cardWidth - 120, 35, 90, 26, 13);
            ctx.fill();
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.lineWidth = 1;
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
            ctx.font = 'bold 10px Arial';
            ctx.fillText('VERIFIED', cardWidth - 92, 52);
        }

        // Agent avatar placeholder
        const avatarGradient = ctx.createLinearGradient(30, 110, 100, 180);
        avatarGradient.addColorStop(0, '#475569');
        avatarGradient.addColorStop(1, '#334155');
        ctx.fillStyle = avatarGradient;
        roundRect(ctx, 30, 110, 70, 70, 16);
        ctx.fill();

        // Initial
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        const initial = agentName.charAt(0).toUpperCase();
        const textMetrics = ctx.measureText(initial);
        ctx.fillText(initial, 65 - textMetrics.width / 2, 155);

        // Agent name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(agentName, 115, 140);

        // Specialization
        if (specialization) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px Arial';
            ctx.fillText(specialization, 115, 160);
        }

        // Location
        if (location) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Arial';
            ctx.fillText(`📍 ${location}`, 115, 180);
        }

        // Agent ID
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Arial';
        ctx.fillText('AGENT ID', 30, 210);
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px monospace';
        ctx.fillText(agentId.slice(0, 12).toUpperCase(), 30, 228);

        // Certified date
        if (certifiedAt) {
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Arial';
            ctx.fillText('CERTIFIED', 30, 255);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.fillText(new Date(certifiedAt).getFullYear().toString(), 30, 273);
        }

        // QR Code
        const qrImage = await loadImage(qrDataUrl);
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, cardWidth - 130, 110, 100, 100, 16);
        ctx.fill();
        ctx.drawImage(qrImage, cardWidth - 120, 120, 80, 80);

        ctx.fillStyle = '#64748b';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN TO VERIFY', cardWidth - 80, 215);
        ctx.textAlign = 'left';

        // Convert to buffer
        const buffer = canvas.toBuffer('image/png');

        // Upload to Appwrite Storage
        const fileId = ID.unique();
        const fileName = `agent_id_${agentId}_${Date.now()}.png`;

        const file = await storage.createFile(
            BUCKET_AGENT_IDS,
            fileId,
            new File([buffer], fileName, { type: 'image/png' })
        );

        const fileUrl = `${process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}/storage/buckets/${BUCKET_AGENT_IDS}/files/${fileId}/view?project=${PROJECT_ID}`;

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
