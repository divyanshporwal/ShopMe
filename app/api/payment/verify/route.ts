import Stripe from "stripe";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/order.model";
import { createOrderWithInventory } from "@/controllers/order.controller";

type CheckoutItem = {
  _id: string;
  quantity?: number;
  price: number;
};

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(secretKey);
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ message: "Payment session not found" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
    }

    const items = JSON.parse(session.metadata?.items || "[]") as CheckoutItem[];
    const userId = session.metadata?.userId;
    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!userId || !paymentId || items.length === 0 || session.amount_total === null) {
      return NextResponse.json({ message: "Invalid payment session" }, { status: 400 });
    }

    // duplicate order
    const existing = await Order.findOne({ paymentId });
    if (existing) {
      return NextResponse.json({ success: true, order: existing });
    }

    const order = await createOrderWithInventory(
      items,
      { _id: userId },
      {
        paymentId,
        paymentStatus: "SUCCESS",
      }
    );

    return NextResponse.json({ success: true, order });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
