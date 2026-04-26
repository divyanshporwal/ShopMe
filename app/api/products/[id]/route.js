import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "@/controllers/product.controller";
import { getAuthUser } from "@/middleware/auth";

export async function GET(req, { params }) {
  await connectDB();

  const product = await getSingleProduct(params.id);

  return NextResponse.json(product);
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    const body = await req.json();

    const updated = await updateProduct(params.id, body, user);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    const result = await deleteProduct(params.id, user);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}