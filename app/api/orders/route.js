import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Order from "@/models/order.model";
import { getAuthUser } from "@/middleware/auth";
import { createOrderWithInventory } from "@/controllers/order.controller";

export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const newOrder = await createOrderWithInventory(body.items, user, {
      paymentStatus: "SUCCESS",
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await Order.find({ userId: user._id })
  .populate("items.productId")
  .sort({ createdAt: -1 });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}