import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyPayment } from "@/controllers/order.controller";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const order = await verifyPayment(body);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}