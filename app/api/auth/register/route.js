import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import MerchantRequest from "@/models/merchantRequest.model";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === "MERCHANT" ? "CUSTOMER" : "CUSTOMER", // Default to CUSTOMER, will be updated if merchant
      isApproved: role === "MERCHANT" ? false : true,
    });

    if (role === "MERCHANT") {
      await MerchantRequest.create({
        userId: user._id,
        status: "PENDING",
      });
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });

  } catch (err) {
    console.error("REGISTER API ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}