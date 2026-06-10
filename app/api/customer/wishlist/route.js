import { NextResponse } from "next/server";
import { getAuthUser } from "@/middleware/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import Product from "@/models/product.model";

export async function GET(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser();
    
    const user = await User.findById(authUser._id).populate({
      path: 'wishlist',
      model: Product
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      wishlist: user.wishlist || [],
      count: (user.wishlist || []).length,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.wishlist)) {
      user.wishlist = [];
    }
    const index = user.wishlist.findIndex(id => id?.toString() === productId?.toString());
    
    let added = false;
    if (index === -1) {
      user.wishlist.push(productId);
      added = true;
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    return NextResponse.json({
      added,
      wishlist: user.wishlist.map(id => id.toString()),
      message: added ? 'Added to wishlist' : 'Removed from wishlist'
    });
  } catch (error) {
    console.error("POST WISHLIST ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
