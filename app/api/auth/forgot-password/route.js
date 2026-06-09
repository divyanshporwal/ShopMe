import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Rate Limiting Logic: Max 3 OTP requests per email per hour.
    // For simplicity, we're not implementing a full Redis rate limiter here,
    // but in a real app, it would go here.

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otpCode: String(otpCode),
          otpExpiry,
          otpAttempts: 0,
        },
      },
      { new: true }
    );

    console.log("[OTP STORED]", {
      email,
      otpCode,
      otpExpiry,
      expiresInMinutes: 15,
      nowMs: Date.now(),
      diffMs: otpExpiry - Date.now(),
    });

    // Read back from DB immediately after save
    const savedUser = await User.findOne({ email });
    console.log("[OTP READBACK]", {
      otpCode: savedUser?.otpCode,
      otpExpiry: savedUser?.otpExpiry,
      otpExpType: typeof savedUser?.otpExpiry,
      isNull: savedUser?.otpExpiry === null,
      isUndefined: savedUser?.otpExpiry === undefined,
    });

    await sendOTPEmail(user.email, otpCode);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
