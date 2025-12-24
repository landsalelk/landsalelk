import jsPDF from 'jspdf';

/**
 * Generate a professional PDF certificate
 * @param {Object} data Certificate data
 * @returns {jsPDF} PDF document
 */
export function generateCertificatePDF(data) {
    const {
        recipientName,
        certificateNumber,
        completionDate,
        modulesCompleted,
        totalModules,
        badgesEarned,
        totalTimeSpent,
    } = data;

    // Create landscape A4 PDF
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background gradient effect (emerald/teal)
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFillColor(20, 184, 166); // Teal-500
    doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

    // Decorative border
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(2);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    doc.setLineWidth(0.5);
    doc.rect(18, 18, pageWidth - 36, pageHeight - 36);

    // Corner decorations
    const cornerSize = 15;
    doc.setFillColor(16, 185, 129);
    // Top-left
    doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, 'F');
    // Top-right
    doc.triangle(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15, pageWidth - 15, 15 + cornerSize, 'F');
    // Bottom-left
    doc.triangle(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15, 15, pageHeight - 15 - cornerSize, 'F');
    // Bottom-right
    doc.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize, 'F');

    // Logo/Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text('LANDSALE.LK', pageWidth / 2, 45, { align: 'center' });

    // Certificate Title
    doc.setFont('times', 'bold');
    doc.setFontSize(42);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('Certificate of Completion', pageWidth / 2, 68, { align: 'center' });

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('Agent Training Academy - Professional Certification Program', pageWidth / 2, 80, { align: 'center' });

    // Decorative line
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 60, 88, pageWidth / 2 + 60, 88);

    // Certification text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('This is to certify that', pageWidth / 2, 102, { align: 'center' });

    // Recipient Name
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(32);
    doc.setTextColor(30, 41, 59);
    doc.text(recipientName, pageWidth / 2, 118, { align: 'center' });

    // Underline for name
    const nameWidth = doc.getTextWidth(recipientName);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - nameWidth / 2 - 10, 122, pageWidth / 2 + nameWidth / 2 + 10, 122);

    // Completion text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('has successfully completed all requirements of the', pageWidth / 2, 135, { align: 'center' });

    // Program name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('LandSale.lk Agent Training Program', pageWidth / 2, 145, { align: 'center' });

    // Achievement stats
    const statsY = 160;
    const statsSpacing = 60;
    const statsStartX = pageWidth / 2 - statsSpacing;

    // Left stat - Modules
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(`${modulesCompleted}/${totalModules}`, statsStartX, statsY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Modules Completed', statsStartX, statsY + 6, { align: 'center' });

    // Center stat - Badges
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(`${badgesEarned?.length || 0}`, pageWidth / 2, statsY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Badges Earned', pageWidth / 2, statsY + 6, { align: 'center' });

    // Right stat - Time
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(`${totalTimeSpent}`, statsStartX + statsSpacing * 2, statsY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Minutes Invested', statsStartX + statsSpacing * 2, statsY + 6, { align: 'center' });

    // Footer - Certificate details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400

    // Left footer
    doc.text(`Certificate #: ${certificateNumber}`, 30, pageHeight - 35);
    doc.text(`Issue Date: ${completionDate}`, 30, pageHeight - 30);

    // Right footer
    doc.text(`Verify at: landsale.lk/verify/${certificateNumber}`, pageWidth - 30, pageHeight - 35, { align: 'right' });
    doc.text('Valid for 1 year from issue date', pageWidth - 30, pageHeight - 30, { align: 'right' });

    // Center footer - Signature area
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 40, pageHeight - 40, pageWidth / 2 + 40, pageHeight - 40);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Authorized Signature', pageWidth / 2, pageHeight - 35, { align: 'center' });

    return doc;
}

/**
 * Download the certificate as PDF
 * @param {Object} data Certificate data
 */
export function downloadCertificatePDF(data) {
    const doc = generateCertificatePDF(data);
    doc.save(`LandSale_Certificate_${data.certificateNumber}.pdf`);
}

/**
 * Get certificate data URL for preview
 * @param {Object} data Certificate data
 * @returns {string} Data URL
 */
export function getCertificatePreviewURL(data) {
    const doc = generateCertificatePDF(data);
    return doc.output('datauristring');
}
