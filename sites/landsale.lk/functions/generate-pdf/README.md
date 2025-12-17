# LandSale.lk PDF Report Generator

An Appwrite Function that generates premium PDF reports for real estate properties with **real-time data** from satellite APIs.

## 📊 Report Types

| Report | Product Type | Description |
|--------|--------------|-------------|
| **Investment Analysis** | `investment_report` | ROI projection, price analysis, market comparables |
| **Property Valuation** | `valuation_report` | Market value estimation, comparable sales |
| **Land Blueprint** | `blueprint` | Survey diagram, dimensions, area calculations |
| **Risk Inspector** | `risk_report` | 5-year disaster history, flood/cyclone risk |

## 🌐 Real Data APIs

This function integrates with **free external APIs** for accurate data:

### Open-Elevation API
- Returns real elevation in meters for any coordinates
- No API key required
- Used for terrain risk analysis

### Open-Meteo Archive API
- 5 years of historical weather data
- Daily rainfall and wind speed
- Automatic flood/cyclone event detection
- 3-day rainfall accumulation algorithm

## 🔧 Environment Variables

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=osclass_landsale_db
PREMIUM_ASSETS_BUCKET=premium-assets
```

## 📦 Deployment

### Deploy to Appwrite Functions

1. Package the function:
```bash
tar -czvf code.tar.gz package.json src node_modules
```

2. Upload to Appwrite Console:
   - Go to **Functions** → Create/Select function
   - Runtime: **Node.js 18.0**
   - Entrypoint: `src/main.js`
   - Upload `code.tar.gz`
   - Configure environment variables
   - Click **Activate**

## 🚀 Usage

### Request Payload

```json
{
  "purchaseId": "unique_purchase_id",
  "propertyId": "property_document_id",
  "productType": "investment_report",
  "userId": "user_id"
}
```

### Product Types
- `investment_report` - Investment Analysis Report
- `valuation_report` - Property Valuation Report
- `blueprint` - Land Survey & Blueprint
- `risk_report` - Property Risk Inspector (with real satellite data)

### Response

```json
{
  "success": true,
  "fileId": "generated_file_id",
  "fileName": "investment_report_propertyId_timestamp.pdf",
  "purchaseId": "purchase_id",
  "dataAccuracy": "90%+",
  "dataSource": "comparable_sales"
}
```

## 📁 Project Structure

```
generate-pdf/
├── package.json          # Dependencies
├── src/
│   └── main.js          # Main function code
├── test/
│   ├── local-test.mjs   # Local testing script
│   └── test-real-api.mjs # Real API integration test
└── code.tar.gz          # Deployment package
```

## 🧪 Local Testing

```bash
# Install dependencies
npm install

# Run local test (mock data)
node test/local-test.mjs

# Run real API test (calls actual APIs)
node test/test-real-api.mjs
```

## 📈 Features

### Investment Report
- Price per perch analysis
- Market average comparison
- 5-year ROI projection
- Comparable properties
- Investment recommendation (STRONG BUY/BUY/HOLD)

### Valuation Report
- Listed price vs estimated value
- Comparable sales table
- Market statistics
- Valuation conclusion

### Blueprint Report
- Property details card
- Plot diagram with corner markers
- Compass direction
- Area calculations (perches, sq ft, sq m)

### Risk Inspector Report
- **Real elevation** from Open-Elevation API
- **5 years weather history** from Open-Meteo
- Flood risk level (Low/Medium/High/Very High)
- Cyclone risk level
- Disaster event timeline with dates
- Overall risk score (0-100)
- Data-driven recommendations

## 🛠️ Dependencies

- `node-appwrite` - Appwrite SDK
- `pdfkit` - PDF generation
- `node-fetch` - API calls

## 📊 District Coverage

Includes market data and coordinates for all 25 Sri Lanka districts:
- Colombo, Gampaha, Kalutara, Kandy, Matale
- Nuwara Eliya, Galle, Matara, Hambantota
- Jaffna, Kurunegala, Puttalam, Anuradhapura
- Polonnaruwa, Badulla, Monaragala, Ratnapura
- Kegalle, Trincomalee, Batticaloa, Ampara
- Vavuniya, Mullaitivu, Kilinochchi, Mannar

## 📜 License

Proprietary - LandSale.lk

## 🔗 Links

- [LandSale.lk](https://landsale.lk)
- [Appwrite Console](https://cloud.appwrite.io)
