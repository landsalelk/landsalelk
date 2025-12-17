import { Client, Databases, Storage, ID, Query } from 'node-appwrite';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import PDFDocument from 'pdfkit';
import Handlebars from 'handlebars';
import validator from 'validator';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { processWithMemoryManagement } from './memory-manager.js';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Configuration
const DATABASE_ID = process.env.DATABASE_ID || 'osclass_landsale_db';
const PDF_BUCKET_ID = process.env.PDF_BUCKET_ID || 'generated_pdfs';
const MAX_PDF_SIZE_MB = parseInt(process.env.MAX_PDF_SIZE_MB || '50');
const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '3');

// PDF Generation Options
const PDF_OPTIONS = {
    format: 'A4',
    margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
    },
    printBackground: true,
    preferCSSPageSize: true,
    timeout: 30000 // 30 seconds
};

// Supported input formats
const SUPPORTED_FORMATS = ['html', 'markdown', 'json', 'template'];

// Page sizes
const PAGE_SIZES = {
    'A4': { width: '210mm', height: '297mm' },
    'A3': { width: '297mm', height: '420mm' },
    'A5': { width: '148mm', height: '210mm' },
    'Letter': { width: '8.5in', height: '11in' },
    'Legal': { width: '8.5in', height: '14in' },
    'Tabloid': { width: '11in', height: '17in' }
};

/**
 * Comprehensive PDF Generation Function
 * Supports HTML, Markdown, JSON, and Template formats
 */
export default async function main({ req, res, log, error }) {
    log('Starting PDF generation process...');

    try {
        // Parse request body
        const body = req.body || {};
        const {
            format = 'html',
            content,
            template,
            data,
            options = {},
            filename,
            metadata = {},
            permissions = []
        } = body;

        // Validate input parameters
        const validation = validateInput(body);
        if (!validation.valid) {
            return res.json({
                success: false,
                error: 'Validation failed',
                details: validation.errors
            }, 400);
        }

        log(`Generating PDF from ${format} format...`);

        // Generate PDF based on format with memory management
        let pdfBuffer;
        let finalFilename = filename || generateFilename(format);

        try {
            pdfBuffer = await processWithMemoryManagement(
                async (browser, jobData) => {
                    const { format, content, template, data, options } = jobData;
                    
                    switch (format.toLowerCase()) {
                        case 'html':
                            return await generateFromHTMLWithBrowser(browser, content, options);
                        case 'markdown':
                            return await generateFromMarkdownWithBrowser(browser, content, options);
                        case 'json':
                            return await generateFromJSONWithBrowser(browser, content, options);
                        case 'template':
                            return await generateFromTemplateWithBrowser(browser, template, data, options);
                        default:
                            throw new Error(`Unsupported format: ${format}`);
                    }
                },
                { format, content, template, data, options },
                {
                    maxConcurrentJobs: MAX_CONCURRENT_JOBS,
                    maxMemoryUsageMB: MAX_PDF_SIZE_MB
                }
            );
        } catch (error) {
            log(`PDF generation failed with memory management: ${error.message}`);
            throw error;
        }

        // Validate PDF size
        if (pdfBuffer.length > MAX_PDF_SIZE_MB * 1024 * 1024) {
            throw new Error(`Generated PDF exceeds maximum size limit of ${MAX_PDF_SIZE_MB}MB`);
        }

        // Upload to Appwrite Storage
        const file = await storage.createFile(
            PDF_BUCKET_ID,
            ID.unique(),
            pdfBuffer,
            finalFilename,
            'application/pdf',
            permissions
        );

        // Create document record
        const document = await databases.createDocument(
            DATABASE_ID,
            'pdf_documents',
            ID.unique(),
            {
                file_id: file.$id,
                filename: finalFilename,
                format: format,
                size: pdfBuffer.length,
                metadata: metadata,
                status: 'completed',
                generated_at: new Date().toISOString()
            },
            permissions
        );

        log(`PDF generated successfully: ${finalFilename} (${format})`);

        return res.json({
            success: true,
            document_id: document.$id,
            file_id: file.$id,
            filename: finalFilename,
            size: pdfBuffer.length,
            format: format,
            download_url: `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${PDF_BUCKET_ID}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`,
            timestamp: new Date().toISOString()
        });

    } catch (e) {
        error(`PDF generation failed: ${e.message}`);
        
        // Log error details for debugging
        log(`Error stack: ${e.stack}`);
        
        return res.json({
            success: false,
            error: 'PDF generation failed',
            message: e.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
}

/**
 * Validate input parameters
 */
function validateInput(input) {
    const errors = [];

    if (!input.content && !input.template) {
        errors.push('Either content or template must be provided');
    }

    if (input.format && !SUPPORTED_FORMATS.includes(input.format.toLowerCase())) {
        errors.push(`Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
    }

    if (input.filename && !validator.isAlphanumeric(input.filename.replace(/[._-]/g, ''))) {
        errors.push('Filename contains invalid characters');
    }

    if (input.options && typeof input.options !== 'object') {
        errors.push('Options must be an object');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generate PDF from HTML content (legacy function without memory management)
 */
async function generateFromHTML(html, options = {}) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Set page options
        const pageOptions = {
            ...PDF_OPTIONS,
            ...options,
            format: options.pageSize || PDF_OPTIONS.format
        };

        // Add CSS for better PDF rendering
        const enhancedHTML = enhanceHTMLForPDF(html, options);
        
        await page.setContent(enhancedHTML, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        const pdfBuffer = await page.pdf(pageOptions);
        
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

/**
 * Generate PDF from HTML content with browser instance (memory managed)
 */
async function generateFromHTMLWithBrowser(browser, html, options = {}) {
    const page = await browser.newPage();
    
    try {
        // Set page options
        const pageOptions = {
            ...PDF_OPTIONS,
            ...options,
            format: options.pageSize || PDF_OPTIONS.format
        };

        // Add CSS for better PDF rendering
        const enhancedHTML = enhanceHTMLForPDF(html, options);
        
        await page.setContent(enhancedHTML, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        const pdfBuffer = await page.pdf(pageOptions);
        
        return pdfBuffer;
    } finally {
        await page.close();
    }
}

/**
 * Generate PDF from Markdown content (legacy function without memory management)
 */
async function generateFromMarkdown(markdown, options = {}) {
    // Convert markdown to HTML
    const html = marked(markdown);
    
    // Wrap in a styled template
    const styledHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                h1, h2, h3 { color: #333; }
                code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
                blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `;
    
    return generateFromHTML(styledHTML, options);
}

/**
 * Generate PDF from Markdown content with browser instance (memory managed)
 */
async function generateFromMarkdownWithBrowser(browser, markdown, options = {}) {
    // Convert markdown to HTML
    const html = marked(markdown);
    
    // Wrap in a styled template
    const styledHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                h1, h2, h3 { color: #333; }
                code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
                blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `;
    
    return generateFromHTMLWithBrowser(browser, styledHTML, options);
}

/**
 * Generate PDF from JSON data (legacy function without memory management)
 */
async function generateFromJSON(jsonData, options = {}) {
    let data;
    
    if (typeof jsonData === 'string') {
        try {
            data = JSON.parse(jsonData);
        } catch (e) {
            throw new Error('Invalid JSON format');
        }
    } else {
        data = jsonData;
    }

    // Convert JSON to HTML table format
    const html = generateJSONToHTML(data, options);
    
    return generateFromHTML(html, options);
}

/**
 * Generate PDF from JSON data with browser instance (memory managed)
 */
async function generateFromJSONWithBrowser(browser, jsonData, options = {}) {
    let data;
    
    if (typeof jsonData === 'string') {
        try {
            data = JSON.parse(jsonData);
        } catch (e) {
            throw new Error('Invalid JSON format');
        }
    } else {
        data = jsonData;
    }

    // Convert JSON to HTML table format
    const html = generateJSONToHTML(data, options);
    
    return generateFromHTMLWithBrowser(browser, html, options);
}

/**
 * Generate PDF from Handlebars template (legacy function without memory management)
 */
async function generateFromTemplate(template, templateData, options = {}) {
    if (!templateData) {
        throw new Error('Template data is required for template format');
    }

    // Compile and render template
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(templateData);
    
    return generateFromHTML(html, options);
}

/**
 * Generate PDF from Handlebars template with browser instance (memory managed)
 */
async function generateFromTemplateWithBrowser(browser, template, templateData, options = {}) {
    if (!templateData) {
        throw new Error('Template data is required for template format');
    }

    // Compile and render template
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(templateData);
    
    return generateFromHTMLWithBrowser(browser, html, options);
}

/**
 * Enhance HTML for better PDF rendering
 */
function enhanceHTMLForPDF(html, options = {}) {
    const pageSize = PAGE_SIZES[options.pageSize] || PAGE_SIZES.A4;
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @page {
                    size: ${pageSize.width} ${pageSize.height};
                    margin: ${options.margin?.top || '20mm'} 
                           ${options.margin?.right || '20mm'} 
                           ${options.margin?.bottom || '20mm'} 
                           ${options.margin?.left || '20mm'};
                }
                
                body {
                    font-family: ${options.fontFamily || 'Arial, sans-serif'};
                    font-size: ${options.fontSize || '12pt'};
                    line-height: ${options.lineHeight || '1.5'};
                    color: ${options.textColor || '#000'};
                    margin: 0;
                    padding: 0;
                }
                
                .pdf-header {
                    position: running(header);
                    font-size: 10pt;
                    color: #666;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                
                .pdf-footer {
                    position: running(footer);
                    font-size: 10pt;
                    color: #666;
                    border-top: 1px solid #ccc;
                    padding-top: 10px;
                    margin-top: 20px;
                    text-align: center;
                }
                
                .page-number::after {
                    content: counter(page);
                }
                
                .total-pages::after {
                    content: counter(pages);
                }
                
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${options.header ? `<div class="pdf-header">${options.header}</div>` : ''}
            ${html}
            ${options.footer ? `<div class="pdf-footer">${options.footer}</div>` : ''}
        </body>
        </html>
    `;
}

/**
 * Convert JSON data to HTML
 */
function generateJSONToHTML(data, options = {}) {
    let html = '<div class="json-document">';
    
    if (Array.isArray(data)) {
        html += '<h2>Data Table</h2>';
        html += '<table>';
        
        // Table headers
        if (data.length > 0) {
            html += '<thead><tr>';
            const headers = Object.keys(data[0]);
            headers.forEach(header => {
                html += `<th>${header}</th>`;
            });
            html += '</tr></thead>';
            
            // Table rows
            html += '<tbody>';
            data.forEach(row => {
                html += '<tr>';
                headers.forEach(header => {
                    html += `<td>${row[header] || ''}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
        }
        
        html += '</table>';
    } else if (typeof data === 'object') {
        html += '<h2>Document Details</h2>';
        html += '<div class="json-object">';
        
        Object.keys(data).forEach(key => {
            html += `<div class="json-field">`;
            html += `<strong>${key}:</strong> `;
            
            if (typeof data[key] === 'object') {
                html += `<pre>${JSON.stringify(data[key], null, 2)}</pre>`;
            } else {
                html += `${data[key]}`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

/**
 * Generate filename based on format and timestamp
 */
function generateFilename(format) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `generated-${format}-${timestamp}.pdf`;
}