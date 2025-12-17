#!/bin/bash

# PDF Generator Deployment Script for Appwrite
# This script packages and deploys the PDF generator function

set -e

echo "🚀 PDF Generator Deployment Script"
echo "=================================="

# Configuration
FUNCTION_NAME="pdf-generator"
FUNCTION_ID="pdf-generator"
APPWRITE_ENDPOINT=${APPWRITE_ENDPOINT:-"https://cloud.appwrite.io/v1"}
APPWRITE_PROJECT_ID=${APPWRITE_PROJECT_ID:-""}
APPWRITE_API_KEY=${APPWRITE_API_KEY:-""}

# Validate required environment variables
if [ -z "$APPWRITE_PROJECT_ID" ]; then
    echo "❌ APPWRITE_PROJECT_ID is not set"
    exit 1
fi

if [ -z "$APPWRITE_API_KEY" ]; then
    echo "❌ APPWRITE_API_KEY is not set"
    exit 1
fi

# Function configuration
FUNCTION_RUNTIME="node-18.0"
FUNCTION_ENTRYPOINT="main.js"
FUNCTION_TIMEOUT=60
FUNCTION_MEMORY=512

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}✓ Configuration validated${NC}"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
cd functions/pdf-generator
npm install --production

# Step 2: Run setup script
echo "🔧 Running setup script..."
node setup.js

# Step 3: Create deployment package
echo "📁 Creating deployment package..."
DEPLOYMENT_DIR="deployment"
mkdir -p $DEPLOYMENT_DIR

# Copy necessary files
cp -r src package.json $DEPLOYMENT_DIR/
cp README.md $DEPLOYMENT_DIR/ 2>/dev/null || true

# Create function archive
cd $DEPLOYMENT_DIR
zip -r ../pdf-generator.zip . -x "*.md" "test/*" "node_modules/.cache/*"
cd ..

# Step 4: Deploy function using Appwrite CLI (if available) or API
echo "🚀 Deploying function to Appwrite..."

# Check if Appwrite CLI is available
if command -v appwrite &> /dev/null; then
    echo "Using Appwrite CLI for deployment..."
    
    # Create or update function
    appwrite functions create \
        --functionId $FUNCTION_ID \
        --name $FUNCTION_NAME \
        --runtime $FUNCTION_RUNTIME \
        --entrypoint $FUNCTION_ENTRYPOINT \
        --timeout $FUNCTION_TIMEOUT \
        --memory $FUNCTION_MEMORY \
        --path pdf-generator.zip || \
    appwrite functions update \
        --functionId $FUNCTION_ID \
        --name $FUNCTION_NAME \
        --runtime $FUNCTION_RUNTIME \
        --entrypoint $FUNCTION_ENTRYPOINT \
        --timeout $FUNCTION_TIMEOUT \
        --memory $FUNCTION_MEMORY \
        --path pdf-generator.zip
    
    echo -e "${GREEN}✓ Function deployed successfully${NC}"
    
else
    echo "Appwrite CLI not found. Please install it or use the Appwrite Console manually."
    echo -e "${YELLOW}Manual deployment instructions:${NC}"
    echo "1. Go to your Appwrite Console"
    echo "2. Navigate to Functions"
    echo "3. Create a new function with these settings:"
    echo "   - Name: $FUNCTION_NAME"
    echo "   - Runtime: $FUNCTION_RUNTIME"
    echo "   - Entrypoint: $FUNCTION_ENTRYPOINT"
    echo "   - Timeout: $FUNCTION_TIMEOUT seconds"
    echo "   - Memory: $FUNCTION_MEMORY MB"
    echo "4. Upload the pdf-generator.zip file"
    echo "5. Configure environment variables"
fi

# Step 5: Configure environment variables
echo "⚙️  Configuring environment variables..."

# Create environment file for manual configuration
cat > .env.pdf-generator << EOF
# PDF Generator Function Environment Variables
APPWRITE_ENDPOINT=$APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID=$APPWRITE_PROJECT_ID
APPWRITE_API_KEY=$APPWRITE_API_KEY
DATABASE_ID=${DATABASE_ID:-"osclass_landsale_db"}
PDF_BUCKET_ID=generated_pdfs
MAX_PDF_SIZE_MB=50
MAX_CONCURRENT_JOBS=3
DEBUG_PDF_GENERATOR=false
EOF

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo "Environment file created: .env.pdf-generator"

# Step 6: Test deployment
echo "🧪 Testing deployment..."
cd ..

# Create test payload
TEST_PAYLOAD=$(cat << 'EOF'
{
    "format": "html",
    "content": "<h1>PDF Generator Test</h1><p>This is a test document to verify the deployment.</p>",
    "filename": "test-deployment.pdf",
    "options": {
        "pageSize": "A4",
        "margin": {
            "top": "20mm",
            "right": "20mm",
            "bottom": "20mm",
            "left": "20mm"
        }
    }
}
EOF
)

# Save test payload
echo "$TEST_PAYLOAD" > test-payload.json

echo -e "${YELLOW}Test payload created: test-payload.json${NC}"
echo "You can test the function using:"
echo "curl -X POST $APPWRITE_ENDPOINT/functions/$FUNCTION_ID/executions \\"
echo "  -H \"X-Appwrite-Project: $APPWRITE_PROJECT_ID\" \\"
echo "  -H \"X-Appwrite-Key: $APPWRITE_API_KEY\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d @test-payload.json"

# Cleanup
echo "🧹 Cleaning up..."
rm -rf deployment test-payload.json

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in Appwrite Console"
echo "2. Test the function with the provided payload"
echo "3. Monitor logs in Appwrite Console"
echo "4. Set up any additional permissions or security rules"

# Display function URL
echo ""
echo "Function URL: $APPWRITE_ENDPOINT/functions/$FUNCTION_ID/executions"
echo "Function ID: $FUNCTION_ID"