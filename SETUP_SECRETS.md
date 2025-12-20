# GitHub Secrets Setup Guide

## Overview
This guide will help you set up the required GitHub Secrets for automatic Appwrite deployments.

## Required Secrets

You need to add these 3 secrets to your GitHub repository:

### 1. APPWRITE_ENDPOINT
- **Name**: `APPWRITE_ENDPOINT`
- **Value**: `https://sgp.cloud.appwrite.io/v1`
- **Description**: Your Appwrite server endpoint URL

### 2. APPWRITE_PROJECT_ID
- **Name**: `APPWRITE_PROJECT_ID`
- **Value**: `landsalelkproject`
- **Description**: Your Appwrite project ID

### 3. APPWRITE_API_KEY
- **Name**: `APPWRITE_API_KEY`
- **Value**: `0d9b993d23064fb072f0a82cfb46a1c72a05001b25bd72fea2f216943dd6f9d98632901756abbc9e47dc3cb7c3f94f490c676464cbeb5a8c50668d4869d1b639cb96d5c614f3d58a82c3dcf22d5b6a192ad325865766883b80ea375258e937d2403a5c5762e1ffe505b159317f295873d3f851af7e86494bd2b100bf0238dc6a`
- **Description**: Your Appwrite API key with appropriate permissions

## Setup Steps

### Method 1: Manual Setup (Recommended)
1. Go to your repository settings: https://github.com/landsalelk/landsalelk/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret one by one:
   - Enter the **Name** (e.g., `APPWRITE_ENDPOINT`)
   - Enter the **Value**
   - Click **"Add secret"**
4. Repeat for all 3 secrets

### Method 2: Using the Setup Workflow
1. Go to the **Actions** tab in your repository
2. Find and run the **"Setup GitHub Secrets"** workflow
3. Follow the instructions displayed in the workflow output

## Verification

After setting up the secrets, you can verify they're working by:

1. Going to **Settings > Secrets and variables > Actions**
2. You should see all 3 secrets listed:
   - ✅ APPWRITE_ENDPOINT
   - ✅ APPWRITE_PROJECT_ID
   - ✅ APPWRITE_API_KEY

## Testing Deployment

Once secrets are configured, test your deployment:

1. Make a small change to any function in the `functions/` directory
2. Push the change to the `main` branch
3. Check the **Actions** tab to see the deployment workflow run
4. The workflow should complete successfully without authentication errors

## Troubleshooting

### Common Issues

1. **"Missing authentication" errors in workflows**
   - Ensure all 3 secrets are added correctly
   - Check secret names match exactly (case-sensitive)

2. **"Invalid endpoint" errors**
   - Verify the APPWRITE_ENDPOINT URL is correct
   - Ensure no extra spaces or characters

3. **"Project not found" errors**
   - Confirm the APPWRITE_PROJECT_ID matches your Appwrite project
   - Check the project exists in your Appwrite console

### Getting Help

If you encounter issues:
1. Check the workflow logs in the **Actions** tab
2. Verify your Appwrite project settings
3. Ensure your API key has the necessary permissions

## Security Notes

- **Never** commit API keys or secrets directly to your code
- **Never** share your API keys in issues, discussions, or commits
- GitHub Secrets are encrypted and only accessible to workflows
- Rotate your API keys regularly for better security

## Next Steps

After successfully setting up secrets:
1. ✅ All security vulnerabilities fixed
2. ✅ Runtime compatibility resolved
3. ✅ GitHub Secrets configured
4. 🔄 Review and merge open PRs #18 and #20
5. 🔄 Test the complete deployment pipeline

Your Appwrite auto-deployment pipeline is now ready to use!