import { NextResponse } from "next/server";
import { generatePayHereHash } from "@/lib/payhere";

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, amount, currency = "LKR" } = body;

    if (!order_id || !amount) {
      return NextResponse.json(
        { error: "order_id and amount are required" },
        { status: 400 },
      );
    }

    // generatePayHereHash only takes (orderId, amount, currency)
    // It gets merchantId and merchantSecret from environment variables internally
    const hash = generatePayHereHash(order_id, amount, currency);

    return NextResponse.json({ hash });
  } catch (error) {
    console.error("PayHere hash generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate hash" },
      { status: 500 },
    );
  }
}
