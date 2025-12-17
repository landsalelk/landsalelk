# Production Environment Setup Guide

## 🚀 Switching from Sandbox to Production

### 1. Appwrite Production Setup

**Create Production Project:**
1. Go to https://cloud.appwrite.io
2. Create a new project for production
3. Note down your Project ID

**Create Production Database:**
1. Create a new database in your production project
2. Set up all collections with the same schema as development
3. Note down your Database ID

**Generate Production API Key:**
1. Go to API Keys section
2. Create a new API key with these scopes:
   - Database (all permissions)
   - Storage (all permissions)
   - Users (read/write)
   - Teams (read/write)

### 2. Update Environment Variables

Copy `.env.production` to `.env.local` and update with your real values:

```bash
# Appwrite Production
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-actual-project-id
APPWRITE_API_KEY=your-actual-api-key
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-actual-database-id

# Payment Gateway Production
PAYHERE_MODE=live
PAYHERE_MERCHANT_ID=your-actual-merchant-id
PAYHERE_MERCHANT_SECRET=your-actual-merchant-secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Your Site Name
```

### 3. Payment Gateway Setup (PayHere)

**Get Production Credentials:**
1. Sign up at https://www.payhere.lk
2. Complete business verification
3. Get your production Merchant ID and Secret
4. Update webhook URL to: `https://your-domain.com/api/payments/notify`

### 4. Database Migration

**Option A: Manual Setup**
- Recreate all collections in production Appwrite
- Set up indexes and relationships
- Configure permissions

**Option B: Automated Migration**
```bash
# Use Appwrite CLI to migrate data
appwrite migrate --endpoint=https://cloud.appwrite.io/v1 --project-id=your-prod-project
```

### 5. Production Deployment

**Build for Production:**
```bash
npm run build
```

**Environment Check:**
```bash
# Verify production configuration
node -e "console.log('Production mode:', process.env.PAYHERE_MODE)"
```

### 6. Post-Deployment Verification

**Test Critical Functions:**
- [ ] User registration/login
- [ ] Property creation
- [ ] Image uploads
- [ ] Payment processing
- [ ] AI property posting

**Monitor Production:**
- Check Appwrite console for errors
- Monitor payment transactions
- Verify email notifications

## 🔧 Production Checklist

- [ ] Updated all API keys to production
- [ ] Changed payment mode to "live"
- [ ] Updated site URL to your domain
- [ ] Configured production Appwrite project
- [ ] Set up production payment gateway
- [ ] Tested all critical functionality
- [ ] Set up monitoring and logging
- [ ] Configured SSL/HTTPS
- [ ] Set up backup strategy

## ⚠️ Important Notes

1. **API Keys**: Never commit production API keys to version control
2. **Payments**: Test with small amounts first
3. **Backups**: Set up regular database backups
4. **Monitoring**: Use tools like Sentry for error tracking
5. **Rate Limiting**: Consider implementing rate limiting for production

## 🆘 Rollback Plan

If issues arise:
1. Switch payment gateway back to sandbox
2. Revert to development Appwrite project
3. Restore from backup if needed
4. Check logs for error details