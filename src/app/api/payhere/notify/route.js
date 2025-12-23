import { NextResponse } from "next/server";
import { verifyPayHereSignature } from "@/lib/payhere";
import { databases, ID, Query } from '@/lib/server/appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || "landsalelkdb";

const COLLECTIONS = {
  TRANSACTIONS: "transactions",
  ACCOUNTS: "user_wallets",
  LISTINGS: "listings",
  AGENTS: "agents",
  DIGITAL_PURCHASES: "digital_purchases",
  AGENT_PAYMENTS: "agent_payments",
};

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // PayHere usually sends x-www-form-urlencoded
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    // 1. Verify Signature
    if (!verifyPayHereSignature(body)) {
      console.error("Invalid PayHere Signature", body);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const {
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      custom_1, // usage: user_id
      custom_2, // usage: payment_type (e.g., 'wallet_deposit', 'listing_boost', 'verification')
    } = body;

    // Status code 2 is Success
    if (status_code !== "2") {
      console.log(
        `Payment ${payment_id} failed or cancelled. Status: ${status_code}`,
      );
      return NextResponse.json({
        status: "ok",
        message: "Ignored non-success status",
      });
    }

    if (!databases) {
        return NextResponse.json(
            { error: 'Server not configured: Appwrite client is missing' },
            { status: 500 }
        );
    }

    // 2. Idempotency Check - use order_id which should be unique per transaction
    // Check both by searching description and by checking digital_purchases if applicable
    let alreadyProcessed = false;

    try {
      // First, try to find by order_id in description (format: "PayHere ID: xxx | Order: order_id")
      const existingByOrder = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.contains("description", order_id), Query.limit(1)],
      );

      if (existingByOrder.total > 0) {
        alreadyProcessed = true;
      }

      // Also check digital_purchases which has payment_id column
      if (!alreadyProcessed) {
        const existingPurchase = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DIGITAL_PURCHASES,
          [Query.equal("payment_id", payment_id), Query.limit(1)],
        );

        if (existingPurchase.total > 0) {
          alreadyProcessed = true;
        }
      }
    } catch (idempotencyError) {
      // If idempotency check fails, log but continue
      // Better to risk duplicate than to fail payment confirmation
      console.warn("Idempotency check warning:", idempotencyError.message);
    }

    if (alreadyProcessed) {
      console.log(`Payment ${payment_id} already processed, skipping`);
      return NextResponse.json({ status: "ok", message: "Already processed" });
    }

    const userId = custom_1 || "anonymous";
    const type = custom_2 || "payment";
    const amount = parseFloat(payhere_amount) || 0;

    // Validate amount
    if (amount <= 0) {
      console.error("Invalid payment amount:", payhere_amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 3. Record Transaction
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        user_id: userId,
        type: type,
        amount: amount,
        currency_code: payhere_currency,
        status: "completed",
        description: `PayHere ID: ${payment_id} | Order: ${order_id}`,
        created_at: new Date().toISOString(),
      },
    );

    // 4. Handle Logic based on Type
    if (type === "wallet_deposit") {
      // Update User Wallet
      const wallets = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACCOUNTS,
        [Query.equal("user_id", userId)],
      );

      if (wallets.total > 0) {
        const wallet = wallets.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.ACCOUNTS,
          wallet.$id,
          {
            balance: wallet.balance + amount,
            total_deposits: (wallet.total_deposits || 0) + amount,
          },
        );
      } else {
        // Create Wallet if not exists
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ACCOUNTS,
          ID.unique(),
          {
            user_id: userId,
            balance: amount,
            currency_code: payhere_currency,
            total_deposits: amount,
            is_active: true,
          },
        );
      }
    }

    // 5. Handle Agent Hiring Payment (order_id format: HIRE_{listingId}_{timestamp})
    if (order_id && order_id.startsWith("HIRE_")) {
      const parts = order_id.split("_");
      if (parts.length >= 2) {
        const listingId = parts[1];

        try {
          // Get listing details
          const listing = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            listingId,
          );

          const agentId = listing.agent_id;
          const platformFeePercent = 0.2; // 20% platform fee
          const platformFee = amount * platformFeePercent;
          const agentShare = amount - platformFee;

          // Create agent_payments record
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.AGENT_PAYMENTS,
            ID.unique(),
            {
              agent_id: agentId || "unknown",
              listing_id: listingId,
              amount: amount,
              platform_fee: platformFee,
              agent_share: agentShare,
              status: "completed",
              payhere_order_id: order_id,
              paid_at: new Date().toISOString(),
            },
          );

          // Activate the listing
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.LISTINGS,
            listingId,
            {
              status: "active",
              verification_code: null, // Clear security token
            },
          );

          // Update agent stats if agent exists
          if (agentId) {
            try {
              const agent = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.AGENTS,
                agentId,
              );

              await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.AGENTS,
                agentId,
                {
                  total_earnings: (agent.total_earnings || 0) + agentShare,
                  listings_uploaded: (agent.listings_uploaded || 0) + 1,
                },
              );
            } catch (agentErr) {
              console.warn("Could not update agent stats:", agentErr.message);
            }
          }

          console.log(`Agent hire payment completed for listing ${listingId}`);
        } catch (listingErr) {
          console.error("Error processing agent hire:", listingErr);
        }
      }
    }

    return NextResponse.json({ status: "ok", message: "Transaction recorded" });
  } catch (error) {
    console.error("PayHere Notify Error:", error);
    // Return 200 OK even on error to prevent PayHere from retrying indefinitely
    // Log the error for investigation
    return NextResponse.json({
      status: "error",
      message: "Processing failed but acknowledged",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal error",
    });
  }
}
