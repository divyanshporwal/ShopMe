import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/controllers/order.controller";
import { getAuthUser } from "@/middleware/auth";

export async function PUT(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    const { orderId, status } = await req.json();

    const order = await updateOrderStatus(orderId, status, user);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}