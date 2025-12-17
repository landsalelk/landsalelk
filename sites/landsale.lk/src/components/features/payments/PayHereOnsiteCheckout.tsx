"use client"

import { useState, useEffect } from "react"
import "payhere-embed-sdk/dist/react.css"
import Payhere from "payhere-embed-sdk/dist/react"
import { toast } from "sonner"

interface OnsiteCheckoutProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (data: any) => void
    onFailure: (error: any) => void
    paymentData: {
        merchant_id: string
        return_url: string
        cancel_url: string
        notify_url: string
        order_id: string
        items: string
        currency: string
        amount: string
        first_name: string
        last_name: string
        email: string
        phone: string
        address: string
        city: string
        country: string
        hash: string
        custom_1?: string
        custom_2?: string
    }
    environment: "sandbox" | "live"
}

export function PayHereOnsiteCheckout({ 
    isOpen, 
    onClose, 
    onSuccess, 
    onFailure, 
    paymentData, 
    environment 
}: OnsiteCheckoutProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const containerId = `payhere-container-${Date.now()}`

    const handleSuccess = (data: any) => {
        console.log("[PayHere Onsite] Payment success:", data)
        setIsProcessing(false)
        onSuccess(data)
        
        // Show success toast
        toast.success("Payment Successful!", {
            description: "Your payment has been processed successfully."
        })
        
        // Close the modal after a short delay
        setTimeout(() => {
            onClose()
        }, 2000)
    }

    const handleFailure = (error: any) => {
        console.error("[PayHere Onsite] Payment failed:", error)
        setIsProcessing(false)
        onFailure(error)
        
        // Show error toast
        toast.error("Payment Failed", {
            description: error.message || "Payment could not be processed. Please try again."
        })
    }

    const handleClose = () => {
        console.log("[PayHere Onsite] Payment dialog closed")
        setIsProcessing(false)
        onClose()
    }

    // Build the embed URL based on environment
    const embedUrl = environment === "live" 
        ? "https://www.payhere.lk/pay/checkout"
        : "https://sandbox.payhere.lk/pay/checkout"

    // Build the complete payment URL with all parameters
    const buildPaymentUrl = () => {
        const params = new URLSearchParams({
            merchant_id: paymentData.merchant_id,
            return_url: paymentData.return_url,
            cancel_url: paymentData.cancel_url,
            notify_url: paymentData.notify_url,
            order_id: paymentData.order_id,
            items: paymentData.items,
            currency: paymentData.currency,
            amount: paymentData.amount,
            first_name: paymentData.first_name,
            last_name: paymentData.last_name,
            email: paymentData.email,
            phone: paymentData.phone,
            address: paymentData.address,
            city: paymentData.city,
            country: paymentData.country,
            hash: paymentData.hash,
            custom_1: paymentData.custom_1 || "",
            custom_2: paymentData.custom_2 || ""
        })
        
        return `${embedUrl}?${params.toString()}`
    }

    // Only render if open
    if (!isOpen) return null

    return (
        <div id={containerId} style={{ position: 'relative', zIndex: 9999 }}>
            <Payhere
                selector={`#${containerId}`}
                embedURL={buildPaymentUrl()}
                open={isOpen}
                onSuccess={handleSuccess}
                onFailure={handleFailure}
                onClose={handleClose}
                
                // Customer information (these are the only additional props supported)
                customerName={`${paymentData.first_name} ${paymentData.last_name}`}
                customerEmail={paymentData.email}
                disableCustomer="yes" // Lock customer fields since we pre-fill them
                
                // Custom fields
                customFields={{
                    custom_1: paymentData.custom_1 || "",
                    custom_2: paymentData.custom_2 || ""
                }}
            />
        </div>
    )
}

// Alternative: Vanilla JavaScript implementation for more control
export function usePayHereOnsite() {
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Load PayHere script dynamically
        const script = document.createElement('script')
        script.src = 'https://www.payhere.lk/lib/payhere.js'
        script.async = true
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(script)
        }
    }, [])

    const startPayment = (paymentData: any, callbacks: {
        onSuccess: (orderId: string) => void
        onFailure: (error: any) => void
        onDismissed: () => void
    }) => {
        if (typeof window !== 'undefined' && (window as any).payhere) {
            setIsLoading(true)

            // Set up event handlers
            ;(window as any).payhere.onCompleted = function onCompleted(orderId: string) {
                console.log("Payment completed. OrderID:", orderId)
                setIsLoading(false)
                callbacks.onSuccess(orderId)
            }

            ;(window as any).payhere.onDismissed = function onDismissed() {
                console.log("Payment dismissed")
                setIsLoading(false)
                callbacks.onDismissed()
            }

            ;(window as any).payhere.onError = function onError(error: any) {
                console.error("Payment error:", error)
                setIsLoading(false)
                callbacks.onFailure(error)
            }

            // Start the payment
            ;(window as any).payhere.startPayment(paymentData)
        } else {
            toast.error("Payment System Error", {
                description: "PayHere payment system is not available. Please try again."
            })
        }
    }

    return { startPayment, isLoading }
}