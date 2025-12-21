# Quick Deployment Guide

## Prerequisites

1. **Login to Appwrite CLI**:
   ```bash
   appwrite login
   ```
   Follow the prompts to authenticate.

2. **Verify Configuration**:
   The project is already configured with:
   - Endpoint: `https://sgp.cloud.appwrite.io/v1`
   - Project ID: `landsalelkproject`

## Deploy Everything

### Option 1: Use the PowerShell Script (Windows)

```powershell
.\deploy.ps1
```

### Option 2: Manual Deployment

#### 1. Configure Client
```bash
appwrite client --endpoint https://sgp.cloud.appwrite.io/v1 --project-id landsalelkproject
```

#### 2. Push Project Settings
```bash
appwrite push settings
```

#### 3. Deploy Site
```bash
appwrite push site --site-id 6941d9280032a28b0536 --with-variables
```

#### 4. Deploy Functions

Deploy all functions at once:
```bash
appwrite push function --with-variables
```

Or deploy individually:
```bash
appwrite push function --function-id generate-pdf --with-variables
appwrite push function --function-id generate-agent-id --with-variables
appwrite push function --function-id generate-certificate --with-variables
appwrite push function --function-id send-email --with-variables
appwrite push function --function-id send-otp-sms --with-variables
appwrite push function --function-id verify-otp --with-variables
appwrite push function --function-id expire-listings --with-variables
appwrite push function --function-id check-subscription-expiry --with-variables
```

## Important Notes

1. **Environment Variables**: Make sure to set environment variables in Appwrite Console:
   - For Site: Go to Sites > landsalelk-updated > Settings > Environment Variables
   - For Functions: Each function needs its own environment variables

2. **Site Environment Variables**:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID=landsalelkproject`
   - `NEXT_PUBLIC_APPWRITE_DATABASE_ID=landsalelkdb`
   - `APPWRITE_API_KEY=your_api_key_here`

3. **Function Environment Variables** (set for each function):
   - `APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID=landsalelkproject`
   - `APPWRITE_API_KEY=your_api_key_here`
   - `DATABASE_ID=landsalelkdb`

## Troubleshooting

- **Session Error**: Run `appwrite login` first
- **Permission Error**: Check your API key has correct permissions
- **Build Error**: Check site logs in Appwrite Console
- **Function Error**: Check function logs in Appwrite Console

## Verify Deployment

1. Check site deployment status in Appwrite Console
2. Visit the deployed site URL
3. Test each function through the Appwrite Console
4. Check logs for any errors

