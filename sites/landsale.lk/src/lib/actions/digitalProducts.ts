"use server"

import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server"
import { ID, Query, ExecutionMethod } from "node-appwrite"
import { DigitalProductType, DIGITAL_PRODUCTS_CATALOG } from "@/lib/constants/products"

// Function ID for PDF generator (must be created in Appwrite Console)
const PDF_FUNCTION_ID = process.env.APPWRITE_PDF_FUNCTION_ID || 'generate-pdf'

interface DigitalProduct {
    id: string
    property_id: string
    type: DigitalProductType
    name: string
    description: string
    price: number // In LKR
    file_id?: string // Link to premium-assets bucket
    preview_file_id?: string // Link to public-showcase bucket (watermarked)
    is_generated: boolean
    created_at: string
}

/**
 * Get available digital products for a property
 */
export async function getDigitalProductsForProperty(propertyId: string) {
    try {
        const { databases } = await createAdminClient()

        // Check if digital_products collection exists
        // For now, return mock products based on catalog
        const products = Object.entries(DIGITAL_PRODUCTS_CATALOG).map(([type, product]) => ({
            id: `${propertyId}_${type}`,
            property_id: propertyId,
            type: type as DigitalProductType,
            name: product.name,
            description: product.description,
            price: product.price,
            icon: product.icon,
            is_available: true
        }))

        return { success: true, products }
    } catch (error: any) {
        console.error("[DigitalProducts] Error:", error)
        return { success: false, products: [], error: error.message }
    }
}

/**
 * Create a purchase record and trigger PDF generation via Appwrite Function
 */
export async function purchaseDigitalProduct({
    propertyId,
    productType,
    userId,
    paymentId
}: {
    propertyId: string
    productType: DigitalProductType
    userId: string
    paymentId: string
}) {
    try {
        const { databases, functions } = await createAdminClient()

        // 1. Create purchase record
        const purchaseId = ID.unique()
        const purchase = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DIGITAL_PURCHASES,
            purchaseId,
            {
                user_id: userId,
                property_id: propertyId,
                product_type: productType,
                payment_id: paymentId,
                status: 'processing',
                created_at: new Date().toISOString()
            }
        )

        console.log(`[DigitalProducts] Purchase created: ${purchase.$id}`)

        // 2. Execute Appwrite Function to generate PDF
        console.log(`[DigitalProducts] Executing PDF function...`)

        try {
            const execution = await functions.createExecution(
                PDF_FUNCTION_ID,
                JSON.stringify({
                    purchaseId: purchase.$id,
                    propertyId,
                    productType,
                    userId
                }),
                false, // async = false means we wait for result
                '/', // path
                ExecutionMethod.POST, // method
                { 'Content-Type': 'application/json' } // headers
            )

            console.log(`[DigitalProducts] Function execution: ${execution.status}`)

            if (execution.status === 'completed') {
                const response = JSON.parse(execution.responseBody || '{}')

                if (response.success) {
                    return {
                        success: true,
                        purchaseId: purchase.$id,
                        fileId: response.fileId,
                        message: "Your report has been generated! Download available now."
                    }
                }
            }

            // If execution failed or still processing
            return {
                success: true,
                purchaseId: purchase.$id,
                message: "Your report is being generated. Please check back in a moment."
            }

        } catch (funcError: any) {
            console.error("[DigitalProducts] Function execution error:", funcError)

            // Still return success for purchase - PDF can be generated later
            return {
                success: true,
                purchaseId: purchase.$id,
                message: "Processing your order. You'll receive the download link shortly."
            }
        }

    } catch (error: any) {
        console.error("[DigitalProducts] Purchase error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Get user's purchased products
 */
export async function getUserPurchases(userId: string) {
    try {
        const { databases } = await createAdminClient()

        const purchases = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DIGITAL_PURCHASES,
            [
                Query.equal('user_id', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(50)
            ]
        )

        return { success: true, purchases: purchases.documents }
    } catch (error: any) {
        console.error("[DigitalProducts] Get purchases error:", error)
        return { success: false, purchases: [], error: error.message }
    }
}

/**
 * Get download link for a purchased product
 * Only works if user has purchased the product
 */
export async function getProductDownloadLink({
    purchaseId,
    userId
}: {
    purchaseId: string
    userId: string
}) {
    try {
        const { databases, storage } = await createAdminClient()

        // 1. Verify the purchase belongs to this user
        const purchase = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.DIGITAL_PURCHASES,
            purchaseId
        )

        if (purchase.user_id !== userId) {
            return { success: false, error: "Unauthorized" }
        }

        if (purchase.status !== 'completed') {
            return { success: false, error: "Product is still being generated" }
        }

        if (!purchase.file_id) {
            return { success: false, error: "File not found" }
        }

        // 2. Generate download URL from Appwrite Storage
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_PREMIUM_BUCKET_ID || 'premium-assets'

        // Get file download URL (valid for viewing with auth)
        const downloadUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${purchase.file_id}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

        return {
            success: true,
            downloadUrl,
            fileName: purchase.file_name || 'report.pdf'
        }
    } catch (error: any) {
        console.error("[DigitalProducts] Download error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Retry PDF generation for a failed purchase
 */
export async function retryPdfGeneration(purchaseId: string, userId: string) {
    try {
        const { databases, functions } = await createAdminClient()

        // Get purchase record
        const purchase = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.DIGITAL_PURCHASES,
            purchaseId
        )

        if (purchase.user_id !== userId) {
            return { success: false, error: "Unauthorized" }
        }

        if (purchase.status === 'completed') {
            return { success: true, message: "Already generated" }
        }

        // Re-execute function
        const execution = await functions.createExecution(
            PDF_FUNCTION_ID,
            JSON.stringify({
                purchaseId,
                propertyId: purchase.property_id,
                productType: purchase.product_type,
                userId
            }),
            false,
            '/',
            ExecutionMethod.POST,
            { 'Content-Type': 'application/json' }
        )

        if (execution.status === 'completed') {
            const response = JSON.parse(execution.responseBody || '{}')
            return {
                success: response.success,
                message: response.success ? "PDF generated successfully!" : "Generation failed"
            }
        }

        return { success: false, error: "Function execution failed" }
    } catch (error: any) {
        console.error("[DigitalProducts] Retry error:", error)
        return { success: false, error: error.message }
    }
}
