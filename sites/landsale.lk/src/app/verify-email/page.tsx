import { Metadata } from "next"
import { redirect } from "next/navigation"
import { verifyEmail } from "@/lib/actions/verification"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Verify Email | LandSale.lk",
    description: "Verify your email address"
}

interface PageProps {
    searchParams: {
        userId?: string
        secret?: string
    }
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
    const { userId, secret } = searchParams

    if (!userId || !secret) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-destructive" />
                            <CardTitle>Invalid Verification Link</CardTitle>
                        </div>
                        <CardDescription>
                            The verification link is invalid or expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please request a new verification email from your account settings.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/dashboard/settings">Go to Settings</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Verify the email
    const result = await verifyEmail(userId, secret)

    if (result.success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-emerald-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            <CardTitle className="text-emerald-600">Email Verified!</CardTitle>
                        </div>
                        <CardDescription>
                            Your email address has been successfully verified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                ✓ You can now receive important notifications
                            </p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                ✓ Your account is more secure
                            </p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                ✓ You'll be marked as a verified user
                            </p>
                        </div>
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Verification failed
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-destructive">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <XCircle className="h-6 w-6 text-destructive" />
                        <CardTitle className="text-destructive">Verification Failed</CardTitle>
                    </div>
                    <CardDescription>
                        {result.error || "Unable to verify your email address"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This could happen if:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>The verification link has expired</li>
                        <li>The link has already been used</li>
                        <li>The link is invalid</li>
                    </ul>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard/settings">Request New Verification Email</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
