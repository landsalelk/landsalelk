"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { getAccount } from "@/lib/appwrite/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

function ResetPasswordForm() {
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
            const errorMessage = err?.message || "Failed to reset password. The link may have expired."
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
                        <CardTitle className="text-2xl font-bold">Password Reset Complete</CardTitle>
                        <CardDescription>Your password has been successfully reset. Redirecting to login...</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Link href="/login" className="text-sm font-medium text-emerald-600 hover:underline">
                            Go to Sign In
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Set New Password</CardTitle>
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
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                    disabled={!userId || !secret}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={!userId || !secret}
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-sm text-red-500">Passwords do not match</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            disabled={loading || !userId || !secret || password.length < 8 || password !== confirmPassword}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                            ) : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                        Back to Sign In
                    </Link>
                    <Link href="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                        Request new reset link
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
                        <CardTitle className="text-xl">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
