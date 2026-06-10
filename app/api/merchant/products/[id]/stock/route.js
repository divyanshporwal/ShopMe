import { NextResponse } from "next/server";
import { getAuthUser } from "@/middleware/auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser();
    
    const { id } = params;
    const body = await req.json();
    
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.merchantId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let newQty = product.stock;
    if (body.delta !== undefined) {
      newQty = Math.max(0, product.stock + body.delta);
    } else if (body.quantity !== undefined) {
      newQty = Math.max(0, Number(body.quantity));
    } else {
      return NextResponse.json({ error: "No update values provided" }, { status: 400 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { stock: newQty },
      { new: true }
    );

    return NextResponse.json({ quantity: newQty, message: "Stock updated" });
  } catch (error) {
    console.error("STOCK UPDATE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
