# PDF Generator Function - API Documentation

## Overview

The PDF Generator function is a serverless Appwrite function that converts various input formats (HTML, Markdown, JSON, Handlebars templates) into PDF documents. It integrates with Appwrite's storage and database services for seamless document management.

## Base URL

```
https://cloud.appwrite.io/v1/functions/pdf-generator/executions
```

## Authentication

All requests require Appwrite API authentication:

```http
X-Appwrite-Project: your-project-id
X-Appwrite-Key: your-api-key
Content-Type: application/json
```

## API Endpoints

### Generate PDF from HTML

**POST** `/functions/pdf-generator/executions`

Convert HTML content to PDF.

**Request Body:**
```json
{
  "format": "html",
  "content": "<h1>Document Title</h1><p>Document content...</p>",
  "filename": "document.pdf",
  "options": {
    "pageSize": "A4",
    "margin": {
      "top": "20mm",
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    },
    "header": "Document Header",
    "footer": "Page {page} of {total}",
    "fontFamily": "Arial, sans-serif",
    "fontSize": "12pt",
    "lineHeight": "1.5"
  },
  "metadata": {
    "author": "John Doe",
    "category": "Reports",
    "tags": ["report", "2024"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "document_id": "doc_1234567890",
  "file_id": "file_1234567890",
  "download_url": "https://cloud.appwrite.io/v1/storage/buckets/generated_pdfs/files/file_1234567890/view?project=your-project-id",
  "size": 102400,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

### Generate PDF from Markdown

**POST** `/functions/pdf-generator/executions`

Convert Markdown content to PDF.

**Request Body:**
```json
{
  "format": "markdown",
  "content": "# Document Title\n\n## Section 1\n\nThis is a paragraph with **bold** and *italic* text.\n\n### Subsection\n\n- List item 1\n- List item 2\n- List item 3\n\n```javascript\nconst code = 'example';\n```",
  "filename": "markdown-document.pdf",
  "options": {
    "pageSize": "Letter",
    "margin": {
      "top": "1in",
      "right": "1in",
      "bottom": "1in",
      "left": "1in"
    }
  }
}
```

### Generate PDF from JSON Data

**POST** `/functions/pdf-generator/executions`

Convert JSON data to a formatted PDF table or document.

**Request Body:**
```json
{
  "format": "json",
  "content": [
    {
      "name": "Product A",
      "price": 29.99,
      "category": "Electronics",
      "inStock": true
    },
    {
      "name": "Product B", 
      "price": 49.99,
      "category": "Books",
      "inStock": false
    }
  ],
  "filename": "products-report.pdf",
  "options": {
    "pageSize": "A4",
    "header": "Product Inventory Report",
    "footer": "Generated on {date}"
  }
}
```

### Generate PDF from Template

**POST** `/functions/pdf-generator/executions`

Generate PDF using a Handlebars template with data.

**Request Body:**
```json
{
  "format": "template",
  "template": "<h1>{{title}}</h1><p>Dear {{customer.name}},</p><p>{{message}}</p><p>Order #{{order.id}} - Total: ${{order.total}}</p>",
  "data": {
    "title": "Order Confirmation",
    "customer": {
      "name": "Jane Smith"
    },
    "message": "Thank you for your order!",
    "order": {
      "id": "ORD-2024-001",
      "total": 149.99
    }
  },
  "filename": "order-confirmation.pdf",
  "options": {
    "pageSize": "A4",
    "margin": {
      "top": "30mm",
      "bottom": "30mm"
    }
  }
}
```

## Request Parameters

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Input format: `html`, `markdown`, `json`, `template` |
| `content` | string | Content to convert (for html, markdown, json formats) |
| `template` | string | Handlebars template (for template format) |
| `data` | object | Template data (for template format) |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filename` | string | Auto-generated | Output filename |
| `options` | object | See below | PDF generation options |
| `metadata` | object | `{}` | Custom metadata to store with document |
| `permissions` | array | `[]` | Document permissions |

### PDF Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pageSize` | string | `A4` | Page size: `A4`, `A3`, `A5`, `Letter`, `Legal`, `Tabloid` |
| `margin` | object | `{top: '20mm', right: '20mm', bottom: '20mm', left: '20mm'}` | Page margins |
| `header` | string | `null` | Header text (supports `{page}` and `{total}` placeholders) |
| `footer` | string | `null` | Footer text (supports `{page}` and `{total}` placeholders) |
| `fontFamily` | string | `Arial, sans-serif` | Font family |
| `fontSize` | string | `12pt` | Font size |
| `lineHeight` | string | `1.5` | Line height |
| `textColor` | string | `#000` | Text color |

## Response Codes

### Success Responses

- **200 OK**: PDF generated successfully
- **201 Created**: PDF generated and stored successfully

### Error Responses

- **400 Bad Request**: Invalid input parameters
- **413 Payload Too Large**: Generated PDF exceeds size limit (50MB)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error during PDF generation

### Error Response Format

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Format is required",
  "details": ["Format is required", "Content is required"]
}
```

## Memory Management

The function implements browser pooling and job queuing for efficient memory usage:

- **Max Concurrent Jobs**: 3 (configurable)
- **Max PDF Size**: 50MB
- **Browser Pool**: Reuses browser instances for better performance
- **Job Queue**: Manages processing of multiple requests
- **Automatic Cleanup**: Periodic cleanup of unused resources

## Usage Examples

### cURL Example

```bash
curl -X POST https://cloud.appwrite.io/v1/functions/pdf-generator/executions \
  -H "X-Appwrite-Project: your-project-id" \
  -H "X-Appwrite-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "html",
    "content": "<h1>Hello World</h1><p>This is a test PDF.</p>",
    "filename": "test.pdf"
  }'
```

### JavaScript Example

```javascript
const response = await fetch('https://cloud.appwrite.io/v1/functions/pdf-generator/executions', {
  method: 'POST',
  headers: {
    'X-Appwrite-Project': 'your-project-id',
    'X-Appwrite-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    format: 'markdown',
    content: '# Report\n\nThis is a markdown report.',
    options: {
      pageSize: 'A4',
      margin: { top: '30mm', bottom: '30mm' }
    }
  })
});

const result = await response.json();
console.log('PDF generated:', result.download_url);
```

### Python Example

```python
import requests
import json

url = "https://cloud.appwrite.io/v1/functions/pdf-generator/executions"
headers = {
    "X-Appwrite-Project": "your-project-id",
    "X-Appwrite-Key": "your-api-key",
    "Content-Type": "application/json"
}

data = {
    "format": "json",
    "content": json.dumps([
        {"name": "Item 1", "value": 100},
        {"name": "Item 2", "value": 200}
    ]),
    "filename": "data-report.pdf"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print("PDF URL:", result["download_url"])
```

## Rate Limiting

- **Requests per minute**: 60
- **Concurrent executions**: 3
- **Daily limit**: 1000 requests

## Storage Integration

Generated PDFs are automatically stored in Appwrite Storage:

- **Bucket**: `generated_pdfs`
- **File ID**: Returned in response
- **Permissions**: Configurable via `permissions` parameter
- **Metadata**: Stored in `pdf_documents` collection

## Database Integration

Document metadata is stored in the `pdf_documents` collection:

- **file_id**: Reference to storage file
- **filename**: Original filename
- **format**: Input format used
- **size**: File size in bytes
- **metadata**: Custom metadata
- **status**: Document status
- **generated_at**: Generation timestamp

## Error Handling

The function includes comprehensive error handling for common scenarios:

- **Input Validation**: Validates all required parameters
- **Format Validation**: Ensures supported input formats
- **Size Limits**: Enforces maximum PDF size (50MB)
- **Memory Management**: Handles large documents efficiently
- **Timeout Handling**: Configurable timeout for long-running jobs

## Performance Considerations

- **Browser Pooling**: Reuses browser instances for better performance
- **Job Queuing**: Manages concurrent requests efficiently
- **Memory Cleanup**: Automatic cleanup of unused resources
- **Caching**: Future support for template caching

## Security

- **API Key Authentication**: All requests require valid API key
- **Permission System**: Configurable document permissions
- **Input Sanitization**: HTML content is sanitized
- **Rate Limiting**: Prevents abuse and resource exhaustion

## Monitoring

Monitor function performance through:

- **Appwrite Console**: Function execution logs
- **Response Times**: Track generation performance
- **Error Rates**: Monitor failure rates
- **Memory Usage**: Track resource consumption

## Troubleshooting

### Common Issues

1. **PDF Generation Timeout**
   - Increase timeout in function settings
   - Reduce document complexity
   - Check for large images or assets

2. **Memory Issues**
   - Reduce concurrent job limit
   - Optimize HTML content
   - Split large documents

3. **Invalid Format Errors**
   - Verify input format parameter
   - Check content structure
   - Validate JSON syntax

4. **Permission Errors**
   - Check API key permissions
   - Verify bucket permissions
   - Review document permissions

### Debug Mode

Enable debug mode by setting environment variable:
```
DEBUG_PDF_GENERATOR=true
```

This provides additional logging for troubleshooting.