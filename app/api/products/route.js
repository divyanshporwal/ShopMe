import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/controllers/product.controller";
import { getAuthUser } from "@/middleware/auth";

export async function GET() {
  await connectDB();

  const products = await getAllProducts();

  return NextResponse.json(products);
}

export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    const body = await req.json();

    const product = await createProduct(body, user);

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}