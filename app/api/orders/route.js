import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Order from "@/models/order.model";
import { getAuthUser } from "@/middleware/auth";

export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    console.log("BODY:", body);

    const totalAmount = body.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      userId: user._id,
      items: body.items,
      totalAmount,
      status: "PENDING",
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
    console.log("USER:", user); // 👈 ADD THIS

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