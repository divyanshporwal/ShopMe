import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import MerchantRequest from "@/models/merchantRequest.model";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  nameErrorMessage,
  passwordErrorMessage,
  validateName,
  validatePassword,
} from "@/utils/validators";
import { signToken } from "@/lib/jwt";

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

    if (!validateName(name)) {
      return NextResponse.json(
        { success: false, message: nameErrorMessage },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, message: passwordErrorMessage },
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

    const token = signToken({
      id: user._id,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("REGISTER API ERROR:", err);

    if (err?.name === "ValidationError") {
      const message = Object.values(err.errors || {})
        .map((error) => error.message)
        .join(" ");

      return NextResponse.json(
        { success: false, message: message || "Invalid input" },
        { status: 400 }
      );
    }

    if (err?.message) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}