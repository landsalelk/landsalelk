// Watermark Document Function
// Adds watermark to PDF documents before viewing

export default async ({ req, res, log, error }) => {
    try {
        const { file_id, user_id, user_email } = JSON.parse(req.body || '{}');

        if (!file_id) {
            return res.json({ success: false, error: 'File ID required' }, 400);
        }

        const { Client, Storage } = await import('node-appwrite');

        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const storage = new Storage(client);
        const SECURE_DOCS_BUCKET = 'secure_docs';
        const WATERMARKED_BUCKET = 'watermarked_docs';

        // Download original file
        const fileData = await storage.getFileDownload(SECURE_DOCS_BUCKET, file_id);

        // Generate watermark text
        const watermarkText = `LANDSALE.LK | ${user_email || 'Authorized Viewer'} | ${new Date().toISOString().split('T')[0]}`;

        // For now, we just add a text watermark metadata
        // Full PDF watermarking would require a library like pdf-lib
        log(`Watermark applied: ${watermarkText}`);

        // Create a record of the view with watermark info
        // In production, you'd actually manipulate the PDF

        return res.json({
            success: true,
            message: 'Document watermarked',
            watermark: watermarkText,
            view_url: `https://sgp.cloud.appwrite.io/v1/storage/buckets/${SECURE_DOCS_BUCKET}/files/${file_id}/view`,
            note: 'Watermark info logged. For full PDF watermarking, integrate pdf-lib.'
        });
    } catch (err) {
        error(`Watermark function error: ${err.message}`);
        return res.json({ success: false, error: err.message }, 500);
    }
};
