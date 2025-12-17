---
description: Integrate Appwrite's Native Authentication Features
---

# Appwrite Authentication Integration Plan

## Current Status
✅ **Already Using:**
- Email/Password authentication
- Session management
- User account creation

❌ **Not Yet Integrated:**
- Email verification
- Phone verification (SMS)
- OAuth providers
- Anonymous sessions
- Account recovery

## Available Appwrite Auth Features

### 1. Email Verification (Built-in)
**API Methods:**
- `account.createVerification(url)` - Send verification email
- `account.updateVerification(userId, secret)` - Verify email with token
- Check status: `user.emailVerification` (boolean)

**Implementation:**
- Add verification email sending after signup
- Create `/verify-email` page to handle verification callback
- Show verification badge on verified profiles

### 2. Phone Verification (SMS)
**API Methods:**
- `account.createPhoneVerification()` - Send SMS OTP
- `account.updatePhoneVerification(userId, secret)` - Verify phone with OTP
- Check status: `user.phoneVerification` (boolean)

**Implementation:**
- Add phone number field to signup/settings
- Create phone verification flow with OTP input
- Display phone verified badge

### 3. OAuth2 Providers (Optional)
**Available Providers (Currently Disabled):**
- Google
- Facebook
- GitHub
- Apple
- Microsoft
- etc.

**Benefits:**
- One-click signup/login
- Auto-verified email
- Better user experience
- Reduced friction

### 4. Anonymous Sessions
**Use Case:**
- Allow browsing without account
- Save favorites/searches temporarily
- Convert to full account later

## Implementation Tasks

### Phase 4A: Email Verification
1. Create verification email template in Appwrite
2. Add "Send Verification Email" button to settings
3. Create `/verify-email/[userId]/[secret]` page
4. Add verification badge to user profiles
5. Add verification status to dashboard

### Phase 4B: Phone Verification  
1. Add phone number field to user profile
2. Create phone verification modal with OTP input
3. Integrate with Appwrite Phone Auth
4. Add phone verified badge
5. Optional: Require phone for premium listings

### Phase 4C: OAuth Integration (Optional)
1. Enable Google OAuth in Appwrite console
2. Add "Sign in with Google" button
3. Handle OAuth callback
4. Auto-create user profile from OAuth data

### Phase 4D: Account Recovery
1. Implement password reset flow
2. Add "Forgot Password" link
3. Create reset password page
4. Email notification for password changes

## Benefits of Using Appwrite Auth

✅ **Security:**
- Built-in rate limiting
- Secure token generation
- Session management
- CSRF protection

✅ **Reliability:**
- Battle-tested implementation
- Automatic retries
- Error handling
- Logging

✅ **Features:**
- Email templates
- SMS delivery
- Multi-factor auth ready
- Account recovery

✅ **Maintenance:**
- No custom code to maintain
- Automatic security updates
- Scalable infrastructure
- Free tier available

## Next Steps

1. **Immediate:** Integrate email verification (15 min)
2. **Priority:** Add phone verification (30 min)
3. **Optional:** Enable Google OAuth (20 min)
4. **Nice-to-have:** Anonymous browsing (15 min)

**Total Time:** ~1.5 hours for complete auth integration

## Code Examples

### Email Verification
```typescript
// Send verification email
const account = getAccount()
await account.createVerification('https://landsale.lk/verify-email')

// Verify email
await account.updateVerification(userId, secret)
```

### Phone Verification
```typescript
// Send OTP
const account = getAccount()
await account.createPhoneVerification()

// Verify OTP
await account.updatePhoneVerification(userId, otp)
```

### Check Verification Status
```typescript
const user = await account.get()
console.log('Email verified:', user.emailVerification)
console.log('Phone verified:', user.phoneVerification)
```
