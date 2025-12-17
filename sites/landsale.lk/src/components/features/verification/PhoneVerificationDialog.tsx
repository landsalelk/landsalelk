"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    updatePhoneNumber,
    sendPhoneVerification,
    verifyPhone
} from "@/lib/actions/verification"

interface PhoneVerificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPhone?: string
    onVerified: () => void
}

export function PhoneVerificationDialog({
    open,
    onOpenChange,
    currentPhone,
    onVerified
}: PhoneVerificationDialogProps) {
    const [step, setStep] = useState<'phone' | 'otp'>(currentPhone ? 'otp' : 'phone')
    const [phone, setPhone] = useState(currentPhone || '')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)

    const handleUpdatePhone = async () => {
        if (!phone || !password) {
            toast.error("Missing information", {
                description: "Please enter both phone number and password"
            })
            return
        }

        setLoading(true)
        const result = await updatePhoneNumber(phone, password)
        setLoading(false)

        if (result.success) {
            toast.success("Phone number updated", {
                description: "Now sending verification code...",
            })
            handleSendOTP()
        } else {
            toast.error("Failed to update phone", {
                description: result.error,
            })
        }
    }

    const handleSendOTP = async () => {
        setLoading(true)
        const result = await sendPhoneVerification()
        setLoading(false)

        if (result.success) {
            setStep('otp')
            toast.success("OTP sent!", {
                description: "Please check your phone for the verification code.",
            })
        } else {
            toast.error("Failed to send OTP", {
                description: result.error,
            })
        }
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Invalid OTP", {
                description: "Please enter a 6-digit code"
            })
            return
        }

        setLoading(true)
        const result = await verifyPhone(otp)
        setLoading(false)

        if (result.success) {
            toast.success("Phone verified!", {
                description: "Your phone number has been successfully verified.",
            })
            onVerified()
        } else {
            toast.error("Verification failed", {
                description: result.error,
            })
        }
    }

    const handleClose = () => {
        setStep(currentPhone ? 'otp' : 'phone')
        setPhone(currentPhone || '')
        setPassword('')
        setOtp('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {step === 'phone' ? 'Add Phone Number' : 'Verify Phone Number'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'phone'
                            ? 'Enter your phone number to receive a verification code'
                            : 'Enter the 6-digit code sent to your phone'
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 'phone' ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+94 XX XXX XXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Include country code (e.g., +94 for Sri Lanka)
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="password">Confirm Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Required for security
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="text-2xl text-center tracking-widest"
                            />
                        </div>
                        <Button
                            variant="link"
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="px-0 text-sm"
                        >
                            Didn't receive code? Resend
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {step === 'phone' ? (
                        <Button onClick={handleUpdatePhone} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending OTP...
                                </>
                            ) : (
                                "Send OTP"
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleVerifyOTP} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Phone"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
