import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product.model";
import { getAuthUser } from "@/middleware/auth";
import { authorizeRoles } from "@/middleware/roles";
import cloudinary from "@/lib/cloudinary";

// GET all products
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sale = searchParams.get("sale");
    const merchantId = searchParams.get("merchantId");

    const query = {};
    if (category) query.category = category;
    if (sale) query.isSale = true;
    if (merchantId) query.merchantId = merchantId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser();
    authorizeRoles("MERCHANT", "ADMIN")(user);

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const price = Number(formData.get("price"));
    const originalPrice = Number(formData.get("originalPrice")) || undefined;
    const stock = Number(formData.get("stock")) || 1;
    const category = formData.get("category");
    const brand = formData.get("brand");
    const isSale = formData.get("isSale") === "true";
    const isInstant = formData.get("isInstant") === "true";
    const imageFiles = formData.getAll("images");

    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, error: "Title, price and category are required" },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "shopme/products" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });
      imageUrls.push(result.secure_url);
    }

    const product = await Product.create({
      title,
      description,
      price,
      originalPrice,
      stock,
      category,
      brand,
      isSale,
      isInstant,
      images: imageUrls,
      merchantId: user._id,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}