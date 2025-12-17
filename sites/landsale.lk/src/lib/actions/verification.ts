"use server"

import { getAccount } from "@/lib/appwrite/client"
import { createSessionClient } from "@/lib/appwrite/server"

/**
 * Send email verification to the current user
 */
export async function sendEmailVerification() {
    try {
        const { account } = await createSessionClient()

        // Send verification email with callback URL
        const verification = await account.createVerification(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email`
        )

        return {
            success: true,
            message: "Verification email sent! Please check your inbox."
        }
    } catch (error: any) {
        console.error("Error sending verification email:", error)
        return {
            success: false,
            error: error.message || "Failed to send verification email"
        }
    }
}

/**
 * Verify email with userId and secret from the verification link
 */
export async function verifyEmail(userId: string, secret: string) {
    try {
        const { account } = await createSessionClient()

        await account.updateVerification(userId, secret)

        return {
            success: true,
            message: "Email verified successfully!"
        }
    } catch (error: any) {
        console.error("Error verifying email:", error)
        return {
            success: false,
            error: error.message || "Invalid or expired verification link"
        }
    }
}

/**
 * Send phone verification OTP
 */
export async function sendPhoneVerification() {
    try {
        const { account } = await createSessionClient()

        // Send OTP to user's phone
        const token = await account.createPhoneVerification()

        return {
            success: true,
            message: "OTP sent to your phone!"
        }
    } catch (error: any) {
        console.error("Error sending phone verification:", error)
        return {
            success: false,
            error: error.message || "Failed to send OTP"
        }
    }
}

/**
 * Verify phone with OTP code
 */
export async function verifyPhone(otp: string) {
    try {
        const { account } = await createSessionClient()

        // Get current user to get userId
        const user = await account.get()

        await account.updatePhoneVerification(user.$id, otp)

        return {
            success: true,
            message: "Phone verified successfully!"
        }
    } catch (error: any) {
        console.error("Error verifying phone:", error)
        return {
            success: false,
            error: error.message || "Invalid OTP code"
        }
    }
}

/**
 * Update user's phone number
 */
export async function updatePhoneNumber(phone: string, password: string) {
    try {
        const { account } = await createSessionClient()

        await account.updatePhone(phone, password)

        return {
            success: true,
            message: "Phone number updated successfully!"
        }
    } catch (error: any) {
        console.error("Error updating phone:", error)
        return {
            success: false,
            error: error.message || "Failed to update phone number"
        }
    }
}

/**
 * Get current user's verification status
 */
export async function getVerificationStatus() {
    try {
        const { account } = await createSessionClient()
        const user = await account.get()

        return {
            success: true,
            emailVerified: user.emailVerification,
            phoneVerified: user.phoneVerification,
            phone: user.phone
        }
    } catch (error: any) {
        console.error("Error getting verification status:", error)
        return {
            success: false,
            emailVerified: false,
            phoneVerified: false,
            error: error.message
        }
    }
}
