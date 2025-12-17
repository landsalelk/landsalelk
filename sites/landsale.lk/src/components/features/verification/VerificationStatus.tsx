"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Mail, Phone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    getVerificationStatus,
    sendEmailVerification,
    sendPhoneVerification
} from "@/lib/actions/verification"
import { PhoneVerificationDialog } from "./PhoneVerificationDialog"

export function VerificationStatus() {
    const [status, setStatus] = useState<{
        emailVerified: boolean
        phoneVerified: boolean
        phone?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [sendingEmail, setSendingEmail] = useState(false)
    const [phoneDialogOpen, setPhoneDialogOpen] = useState(false)

    useEffect(() => {
        loadStatus()
    }, [])

    const loadStatus = async () => {
        const result = await getVerificationStatus()
        if (result.success) {
            setStatus({
                emailVerified: result.emailVerified,
                phoneVerified: result.phoneVerified,
                phone: result.phone
            })
        }
        setLoading(false)
    }

    const handleSendEmailVerification = async () => {
        setSendingEmail(true)
        const result = await sendEmailVerification()
        setSendingEmail(false)

        if (result.success) {
            toast.success("Verification email sent!", {
                description: "Please check your inbox and click the verification link.",
            })
        } else {
            toast.error("Failed to send email", {
                description: result.error,
            })
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Account Verification</CardTitle>
                    <CardDescription>Loading verification status...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Account Verification</CardTitle>
                    <CardDescription>
                        Verify your email and phone to increase trust and security
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Email Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className={`h-5 w-5 ${status?.emailVerified ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                            <div>
                                <p className="font-medium">Email Verification</p>
                                <p className="text-sm text-muted-foreground">
                                    {status?.emailVerified ? 'Your email is verified' : 'Verify your email address'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {status?.emailVerified ? (
                                <Badge className="bg-emerald-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            ) : (
                                <>
                                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Not Verified
                                    </Badge>
                                    <Button
                                        size="sm"
                                        onClick={handleSendEmailVerification}
                                        disabled={sendingEmail}
                                    >
                                        {sendingEmail ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Verification Email"
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Phone Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Phone className={`h-5 w-5 ${status?.phoneVerified ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                            <div>
                                <p className="font-medium">Phone Verification</p>
                                <p className="text-sm text-muted-foreground">
                                    {status?.phoneVerified
                                        ? `Verified: ${status.phone}`
                                        : status?.phone
                                            ? `Verify: ${status.phone}`
                                            : 'Add and verify your phone number'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {status?.phoneVerified ? (
                                <Badge className="bg-emerald-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            ) : (
                                <>
                                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Not Verified
                                    </Badge>
                                    <Button
                                        size="sm"
                                        onClick={() => setPhoneDialogOpen(true)}
                                    >
                                        {status?.phone ? "Verify Phone" : "Add Phone"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="font-medium text-sm mb-2">Benefits of Verification:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>✓ Increased trust from buyers and sellers</li>
                            <li>✓ Higher visibility for your listings</li>
                            <li>✓ Protection against fraud</li>
                            <li>✓ Faster transaction processing</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <PhoneVerificationDialog
                open={phoneDialogOpen}
                onOpenChange={setPhoneDialogOpen}
                currentPhone={status?.phone}
                onVerified={() => {
                    loadStatus()
                    setPhoneDialogOpen(false)
                }}
            />
        </>
    )
}
