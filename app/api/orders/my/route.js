import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserOrders } from "@/controllers/order.controller";
import { getAuthUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    const orders = await getUserOrders(user._id);

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}