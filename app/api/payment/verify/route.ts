import Stripe from "stripe";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await connectDB();

    const { session_id } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
    }

    const items = JSON.parse(session.metadata.items);
    const userId = session.metadata.userId;

    // جلوگیری از duplicate order
    const existing = await Order.findOne({ paymentId: session.payment_intent });
    if (existing) {
      return NextResponse.json({ success: true, order: existing });
    }

    const order = await Order.create({
      userId,
      items: items.map((item) => ({
        productId: item._id,
        quantity: 1,
        price: item.price,
      })),
      totalAmount: session.amount_total / 100,
      status: "SUCCESS",
      paymentId: session.payment_intent,
      paymentStatus: "SUCCESS",
    });

    return NextResponse.json({ success: true, order });

  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}