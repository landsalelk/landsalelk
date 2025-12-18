/**
 * Watermark Utility
 * Adds a text watermark to an image or PDF (simulated for PDF by converting to image first if needed)
 */

export async function addWatermarkToImage(imageUrl, watermarkText = 'LandSale.lk Verified') {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Watermark style
            const fontSize = Math.max(24, img.width * 0.05); // Responsive font size
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Rotate and repeat
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(watermarkText, 0, 0);

            // Add reference ID
            ctx.font = `bold ${fontSize * 0.5}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillText(`Ref: ${Date.now().toString(36).toUpperCase()}`, 0, fontSize * 1.5);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
}
