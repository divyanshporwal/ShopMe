import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { getAuthUser } from "@/middleware/auth";
import cloudinary from "@/lib/cloudinary";

// ✅ GET single product
export async function GET(req, context) {
  try {
    await connectDB();

    // ✅ FIX: unwrap params
    const { id } = await context.params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE product
export async function DELETE(req, context) {
  try {
    await connectDB();

    // ✅ FIX: unwrap params
    const { id } = await context.params;

    const user = await getAuthUser();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Authorization check
    if (
      product.merchantId.toString() !== user._id.toString() &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // ✅ Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary delete failed:", err);
        }
      }
    }

    await product.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}