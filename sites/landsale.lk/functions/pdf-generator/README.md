# PDF Generator Function for Appwrite

A comprehensive serverless function that generates PDF documents from various input formats (HTML, Markdown, JSON, Templates) with customizable options.

## Features

- **Multi-format Support**: Generate PDFs from HTML, Markdown, JSON, and Handlebars templates
- **Customizable Options**: Page size, margins, headers/footers, fonts, colors
- **Memory Management**: Efficient handling of large documents
- **Error Handling**: Comprehensive validation and error reporting
- **Browser Compatible**: Works across all major web browsers
- **Appwrite Integration**: Full integration with Appwrite storage and database

## Installation

1. Install dependencies:
```bash
cd functions/pdf-generator
npm install
```

2. Set up environment variables:
```bash
# Required Appwrite configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=your_database_id

# Optional configuration
MAX_PDF_SIZE_MB=50
MAX_CONCURRENT_JOBS=3
```

3. Run setup script to create necessary collections and buckets:
```bash
node setup.js
```

## Usage

### Basic Usage

```javascript
// Generate PDF from HTML
const response = await fetch('/functions/pdf-generator', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': 'your_project_id'
    },
    body: JSON.stringify({
        format: 'html',
        content: '<h1>Hello World</h1><p>This is a PDF document.</p>',
        filename: 'my-document.pdf',
        options: {
            pageSize: 'A4',
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        }
    })
});
```

### Supported Formats

#### HTML Format
```javascript
{
    format: 'html',
    content: '<h1>Document Title</h1><p>Document content...</p>',
    options: {
        pageSize: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        header: 'Document Header',
        footer: 'Page <span class="page-number"></span> of <span class="total-pages"></span>'
    }
}
```

#### Markdown Format
```javascript
{
    format: 'markdown',
    content: '# Document Title\n\nThis is **bold** text and this is *italic* text.\n\n## Section 2\n- Item 1\n- Item 2\n- Item 3',
    options: {
        pageSize: 'Letter'
    }
}
```

#### JSON Format
```javascript
{
    format: 'json',
    content: [
        { name: 'John Doe', age: 30, city: 'New York' },
        { name: 'Jane Smith', age: 25, city: 'Los Angeles' }
    ],
    options: {
        pageSize: 'A4'
    }
}
```

#### Template Format
```javascript
{
    format: 'template',
    template: '<h1>{{title}}</h1><p>Hello {{name}},</p><p>{{message}}</p>',
    data: {
        title: 'Welcome Email',
        name: 'John Doe',
        message: 'Welcome to our platform!'
    },
    options: {
        pageSize: 'A4'
    }
}
```

## Configuration Options

### Page Sizes
- `A4` (210mm × 297mm) - Default
- `A3` (297mm × 420mm)
- `A5` (148mm × 210mm)
- `Letter` (8.5in × 11in)
- `Legal` (8.5in × 14in)
- `Tabloid` (11in × 17in)

### Margin Options
```javascript
{
    margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
    }
}
```

### Styling Options
```javascript
{
    fontFamily: 'Arial, sans-serif',
    fontSize: '12pt',
    lineHeight: '1.5',
    textColor: '#000000',
    header: 'Custom Header Text',
    footer: 'Page {page} of {total}'
}
```

## Response Format

### Success Response
```json
{
    "success": true,
    "document_id": "document_unique_id",
    "file_id": "file_unique_id",
    "filename": "my-document.pdf",
    "size": 102400,
    "format": "html",
    "download_url": "https://cloud.appwrite.io/v1/storage/buckets/generated_pdfs/files/file_id/view?project=project_id",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
    "success": false,
    "error": "PDF generation failed",
    "message": "Specific error message",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

The function includes comprehensive error handling for:

- **Validation Errors**: Missing required fields, invalid formats, file size limits
- **Content Errors**: Invalid HTML, malformed JSON, template syntax errors
- **System Errors**: Memory issues, browser launch failures, storage problems
- **Timeout Errors**: Document generation taking too long

## Memory Management

The function implements several memory optimization techniques:

1. **Browser Pool Management**: Reuses browser instances when possible
2. **Stream Processing**: Processes large documents in chunks
3. **Automatic Cleanup**: Closes browser instances and cleans up temporary files
4. **Size Limits**: Enforces maximum PDF size limits to prevent memory issues

## Security

- **Input Validation**: All inputs are validated and sanitized
- **File Type Restrictions**: Only PDF files are allowed in storage
- **Permission Controls**: Respects Appwrite permission system
- **Size Limits**: Prevents abuse with file size restrictions

## Performance Optimization

- **Concurrent Job Limits**: Configurable maximum concurrent PDF generations
- **Caching**: Future implementation for frequently generated documents
- **Compression**: PDF files are compressed automatically
- **Lazy Loading**: Browser instances are created only when needed

## Browser Compatibility

Tested and verified to work with:
- Chrome/Chromium (primary)
- Firefox
- Safari
- Edge

## Deployment

1. Package the function:
```bash
cd functions/pdf-generator
zip -r pdf-generator.zip . -x "node_modules/*" "test/*" "*.md"
```

2. Deploy to Appwrite Console:
   - Go to Functions in Appwrite Console
   - Create new function
   - Upload the zip file
   - Configure environment variables
   - Deploy

3. Test the deployment:
```bash
curl -X POST https://cloud.appwrite.io/v1/functions/pdf-generator/executions \
  -H "X-Appwrite-Project: your_project_id" \
  -H "X-Appwrite-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "html",
    "content": "<h1>Test PDF</h1><p>Hello World!</p>"
  }'
```

## Monitoring

The function logs detailed information about:
- PDF generation start/completion
- Format and options used
- File sizes and processing times
- Error details and stack traces

Access logs through Appwrite Console Functions section.

## Troubleshooting

### Common Issues

1. **Browser Launch Failures**: Ensure sufficient memory and proper sandbox settings
2. **Large File Timeouts**: Increase timeout settings or optimize content
3. **Memory Issues**: Reduce concurrent job limits or optimize content processing
4. **Storage Errors**: Verify bucket permissions and storage limits

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG_PDF_GENERATOR=true
```

## Future Enhancements

- [ ] Watermark support
- [ ] Digital signatures
- [ ] Multi-language support
- [ ] Advanced template engine
- [ ] Batch PDF generation
- [ ] PDF merging/splitting
- [ ] OCR text extraction
- [ ] PDF encryption/password protection