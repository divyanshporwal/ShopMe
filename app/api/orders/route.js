import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { createOrder } from "@/controllers/order.controller";
import { getAuthUser } from "@/middleware/auth";

export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    const { items } = await req.json();

    const result = await createOrder(items, user);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}