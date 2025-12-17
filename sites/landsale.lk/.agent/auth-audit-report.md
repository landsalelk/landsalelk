# Authentication Audit Report - LandSale.lk with Appwrite

**Date:** December 16, 2025  
**Auditor:** Antigravity AI  
**Scope:** Login, Registration, Logout, Session Management

---

## 📊 Executive Summary

| Area | Status | Issues Found |
|------|--------|--------------|
| **Login (Email/Password)** | ✅ Good | 0 Critical, 1 Minor |
| **Login (Google OAuth)** | ⚠️ Needs Fix | 1 Critical Issue |
| **Registration** | ✅ Good | 0 Critical, 1 Minor |
| **Logout** | ⚠️ Needs Fix | 1 Critical Issue |
| **Session Management** | ✅ Good | 1 Minor |
| **Middleware Protection** | ✅ Good | 0 Issues |
| **Password Reset** | 🔴 Missing | 1 Critical Issue |

---

## 🔍 Detailed Findings

### 1. LOGIN (Email/Password) - `src/app/(auth)/login/page.tsx`

**✅ What's Working:**
- Uses Appwrite's `account.createEmailPasswordSession()` correctly
- Session stored in HttpOnly cookie via server action (secure)
- Error handling clears invalid sessions
- Redirects logged-in users away from login page
- Toast notifications for success/failure

**⚠️ Minor Issue:**
- Line 60: `router.refresh()` followed by `router.push()` may cause race condition
- **Recommendation:** Wait for refresh to complete or use single navigation

---

### 2. LOGIN (Google OAuth) - `src/app/auth/callback/route.ts`

**🔴 CRITICAL ISSUE: OAuth Callback Missing HttpOnly Flag**

```typescript
// Current code (line 27-32):
cookieStore.set('appwrite-session', session.secret, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
    // ❌ MISSING: httpOnly: true
})
```

**Risk:** Without `httpOnly: true`, the session cookie can be accessed by JavaScript, making it vulnerable to XSS attacks.

**Fix Required:** Add `httpOnly: true` to the cookie options.

---

### 3. REGISTRATION - `src/app/(auth)/signup/page.tsx`

**✅ What's Working:**
- Uses Appwrite's `account.create()` correctly with `ID.unique()`
- Auto-signs in after registration
- Password strength indicator
- Form validation (name, email, password)
- Session stored in HttpOnly cookie

**⚠️ Minor Issue:**
- Same race condition as login page with `router.refresh()`

---

### 4. LOGOUT - `src/components/layout/header.tsx`

**🔴 CRITICAL ISSUE: Session Cookie Not Cleared on Logout**

```typescript
// Current code (lines 55-64):
const handleSignOut = async () => {
    try {
        const account = getAccount()
        await account.deleteSession('current')
        setUser(null)
        window.location.href = '/'
    } catch (error) {
        console.error("Error signing out:", error)
    }
}
```

**Problem:** 
- Only deletes the Appwrite session on the server
- Does NOT clear the `appwrite-session` cookie
- User can potentially still be authenticated if the cookie persists

**Comparison with Server Action:**
```typescript
// src/lib/actions/auth.ts - signOut() - CORRECT approach:
export async function signOut() {
    const { account } = await createSessionClient()
    await account.deleteSession('current')
    const cookieStore = await cookies()
    cookieStore.delete('appwrite-session')  // ✅ Clears cookie
    redirect('/login')
}
```

**Fix Required:** Use the server action `signOut()` instead of client-side logout.

---

### 5. PASSWORD RESET - MISSING PAGE

**🔴 CRITICAL ISSUE: Reset Password Landing Page Missing**

The forgot-password flow sends users to `/reset-password` but this page doesn't exist:

```typescript
// src/app/(auth)/forgot-password/page.tsx line 31:
await account.createRecovery(email, `${siteUrl}/reset-password`)
```

**Result:** Users clicking the reset link in their email get a 404 error.

**Fix Required:** Create `src/app/(auth)/reset-password/page.tsx`

---

### 6. SESSION MANAGEMENT

**✅ What's Working:**
- `SessionManager.tsx` validates sessions every 5 minutes
- `middleware.ts` protects `/dashboard/*` routes
- `middleware.ts` redirects logged-in users away from auth pages
- Security headers properly set (CSP, HSTS, X-Frame-Options)

**⚠️ Minor Issue:**
- `SessionManager` doesn't handle the case where session is valid but API key lacks scope (see `getCurrentUser` workaround)

---

### 7. SERVER-SIDE SESSION HANDLING

**✅ What's Working:**
- `createSessionClient()` properly reads session from cookie
- `createAdminClient()` uses API key for elevated operations
- `getCurrentUser()` handles scope errors gracefully

---

## 🛠️ Required Fixes

### Fix 1: OAuth Callback - Add HttpOnly Flag

**File:** `src/app/auth/callback/route.ts`

```typescript
// Line 27-33: Add httpOnly: true
cookieStore.set('appwrite-session', session.secret, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true  // ADD THIS LINE
})
```

### Fix 2: Header Logout - Use Server Action

**File:** `src/components/layout/header.tsx`

```typescript
// Import at top:
import { signOut } from "@/lib/actions/auth"

// Replace handleSignOut function:
const handleSignOut = async () => {
    await signOut()  // Server action handles everything
}
```

### Fix 3: Create Reset Password Page

**File:** `src/app/(auth)/reset-password/page.tsx` - CREATE NEW FILE

```typescript
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getAccount } from "@/lib/appwrite/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    useEffect(() => {
        if (!userId || !secret) {
            setError("Invalid reset link. Please request a new password reset.")
        }
    }, [userId, secret])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const account = getAccount()
            await account.updateRecovery(userId!, secret!, password)
            
            setSuccess(true)
            toast.success("Password reset successful!", { description: "You can now sign in with your new password." })
            
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err: any) {
            const errorMessage = err?.message || "Failed to reset password"
            setError(errorMessage)
            toast.error("Reset failed", { description: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                        <CardTitle>Password Reset Complete</CardTitle>
                        <CardDescription>Redirecting to login...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleReset} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                    disabled={!userId || !secret}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <PasswordStrength password={password} showRequirements={password.length > 0} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={!userId || !secret}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full bg-emerald-600 hover:bg-emerald-700" 
                            disabled={loading || !userId || !secret || password.length < 8}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                        Back to Sign In
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
```

---

## ✅ Security Checklist

| Check | Status |
|-------|--------|
| Passwords hashed by Appwrite | ✅ Yes (handled by Appwrite) |
| Session cookies HttpOnly | ⚠️ Partial (OAuth callback missing) |
| Session cookies Secure (production) | ✅ Yes |
| Session cookies SameSite | ✅ Yes (lax) |
| CSRF protection | ✅ Yes (SameSite cookie) |
| Rate limiting | ⚠️ Handled by Appwrite |
| Password strength validation | ✅ Yes (client-side) |
| Email validation | ✅ Yes (client-side) |
| Protected route middleware | ✅ Yes |
| XSS protection headers | ✅ Yes (CSP) |
| Clickjacking protection | ✅ Yes (X-Frame-Options) |

---

## 📋 Action Items

1. **[CRITICAL]** Fix OAuth callback cookie - add `httpOnly: true`
2. **[CRITICAL]** Fix header logout - use server action
3. **[CRITICAL]** Create reset-password page
4. **[MINOR]** Consider using single navigation instead of refresh+push
5. **[OPTIONAL]** Add email verification flow after registration

