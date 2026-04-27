import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { getAuthUser } from "@/middleware/auth";

export async function GET() {
  try {
    await connectDB();
    const user = await getAuthUser();
    const products = await Product.find({ merchantId: user._id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}