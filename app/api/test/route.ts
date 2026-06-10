import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const sessions = await stripe.checkout.sessions.list({ limit: 1 });
    return NextResponse.json({ 
      session_id: sessions.data[0].id,
      metadata: sessions.data[0].metadata 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
