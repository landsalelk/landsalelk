# Appwrite Functions for LandSale.lk

This directory contains Appwrite Cloud Functions that auto-deploy from GitHub.

## Setup Instructions (Git Deployment)

### 1. Create function in Appwrite Console
1. Go to https://cloud.appwrite.io/console/project-sgp-landsalelkproject/functions
2. Click "Create function +"
3. Select **"Connect Git repository"**
4. Connect to `landsalelk/frontendlandsale` GitHub repo
5. Configure:
   - **Production branch**: `master`
   - **Root directory**: `functions/saved-search-alerts`
   - **Entry point**: `src/main.js`

### 2. Set Environment Variables
In the function's Variables tab, add:

| Variable | Value |
|----------|-------|
| `APPWRITE_FUNCTION_API_ENDPOINT` | `https://cloud.appwrite.io/v1` |
| `APPWRITE_FUNCTION_PROJECT_ID` | `sgp-landsalelkproject` |
| `DATABASE_ID` | Your database ID |

### 3. Set Schedule (for cron functions)
In Settings → Schedule:
- `saved-search-alerts`: `0 8 * * *` (daily at 8 AM)
- `listing-expiry-check`: `0 0 * * *` (daily at midnight)

## Functions

| Function | Description | Schedule |
|----------|-------------|----------|
| `saved-search-alerts` | Emails users about new matching properties | Daily 8 AM |
| `listing-expiry-check` | Auto-expires old listings after 60 days | Daily midnight |

## Auto-Deployment

Once connected to Git, pushing to `master` branch will automatically:
1. Build the function
2. Deploy the new version
3. Activate it immediately
