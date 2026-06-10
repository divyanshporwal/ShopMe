import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthUser } from "@/middleware/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(secretKey);
}

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
  }

  return baseUrl;
}

export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthUser();
    const { items, deliveryAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const productIds = items.map(i => i._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

    for (const item of items) {
      const dbProduct = productMap.get(item._id);
      if (dbProduct) {
        if (dbProduct.stock <= 0) {
          return NextResponse.json({ error: 'This product is out of stock' }, { status: 400 });
        }
        if (dbProduct.stock < item.quantity) {
          return NextResponse.json({ error: `Only ${dbProduct.stock} items available` }, { status: 400 });
        }
      }
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

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
        items: JSON.stringify(
          items.map((item) => ({
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
        userId: user._id.toString(),
        deliveryAddress: JSON.stringify(deliveryAddress || null),
      },

      success_url: `${baseUrl}/customer/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${baseUrl}/customer/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
