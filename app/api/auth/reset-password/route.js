import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sendPasswordResetConfirmation } from "@/lib/email";

export async function POST(req) {
  try {
    await connectDB();
    const { email, resetToken, newPassword } = await req.json();

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.resetToken !== resetToken) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please restart the process." },
        { status: 410 }
      );
    }

    if (!user.resetTokenExpiry || Date.now() > user.resetTokenExpiry) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please restart the process." },
        { status: 410 }
      );
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: "New password cannot be same as old password." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          otpCode: null,
          otpExpiry: null,
          otpAttempts: 0,
        },
      }
    );

    await sendPasswordResetConfirmation(user.email);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
