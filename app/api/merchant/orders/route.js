import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  getMerchantOrders,
  updateOrderStatus,
} from "@/controllers/order.controller";
import { getAuthUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    if (!user || user.role !== "MERCHANT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const orders = await getMerchantOrders(user);

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    const { orderId, status } = await req.json();

    const order = await updateOrderStatus(orderId, status, user);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}