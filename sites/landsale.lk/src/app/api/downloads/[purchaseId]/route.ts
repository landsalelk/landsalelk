// src/app/api/downloads/[purchaseId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";

/**
 * Returns a signed temporary download URL for a completed digital product purchase.
 * URL format: /api/downloads/<purchaseId>?token=... (token is just a placeholder for auth)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const purchaseId = req.nextUrl.pathname.split("/").pop();
        const token = searchParams.get("token"); // In a real app you'd verify this token

        if (!purchaseId) {
            return NextResponse.json({ error: "Missing purchaseId" }, { status: 400 });
        }

        const { databases, storage } = await createAdminClient();

        // 1. Fetch purchase record
        const purchase = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.DIGITAL_PURCHASES,
            purchaseId
        );

        // Simple auth: ensure the request includes a token that matches the purchase's user_id
        // (In production use proper JWT/session validation)
        if (!token || token !== purchase.user_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (purchase.status !== "completed") {
            return NextResponse.json({ error: "Product not ready" }, { status: 400 });
        }

        // 2. Retrieve the file reference (assumes file_id stored in purchase)
        const fileId = purchase.file_id;
        if (!fileId) {
            return NextResponse.json({ error: "File not linked" }, { status: 500 });
        }

        // 3. Generate download URL
        const downloadUrl = storage.getFileDownload(
            "premium-assets",
            fileId
        );

        return NextResponse.json({ success: true, downloadUrl });
    } catch (error: any) {
        console.error("[Download] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
