import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { items } = await req.json(); // ✅ THIS WAS MISSING

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title || "Product",
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity || 1,
      })),

      mode: "payment",

      metadata: {
        items: JSON.stringify(items),
        userId: "USER_ID_HERE",
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customer/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}