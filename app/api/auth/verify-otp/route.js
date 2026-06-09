import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // 1. Fetch fresh user from DB
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "User not found" },
        { status: 404 }
      );
    }

    // 2. Temporary debug log — REMOVE after fix confirmed
    console.log("[OTP VERIFY]", {
      storedOTP: user.otpCode,
      submittedOTP: otp,
      otpExpiry: user.otpExpiry,
      otpExpiryType: typeof user.otpExpiry,
      now: Date.now(),
      diffSeconds: ((user.otpExpiry || 0) - Date.now()) / 1000,
      isExpired: Date.now() > (user.otpExpiry || 0),
      attemptsUsed: user.otpAttempts,
    });

    // 3. Attempt limit check
    if ((user.otpAttempts || 0) >= 5) {
      return NextResponse.json(
        {
          error: "Too many attempts. Request a new OTP.",
          message: "Too many attempts. Request a new OTP.",
        },
        { status: 429 }
      );
    }

    // 4. Expiry check — plain Number comparison, always reliable
    if (!user.otpExpiry || Date.now() > user.otpExpiry) {
      return NextResponse.json(
        { error: "OTP expired", message: "OTP expired" },
        { status: 410 }
      );
    }

    // 5. OTP match — compare as strings to avoid type mismatch
    if (String(user.otpCode) !== String(otp)) {
      await User.findOneAndUpdate({ email }, { $inc: { otpAttempts: 1 } });
      return NextResponse.json(
        { error: "Invalid OTP", message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // 6. OTP correct — generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          otpCode: null,
          otpExpiry: null,
          otpAttempts: 0,
        },
      }
    );

    return NextResponse.json({ resetToken }, { status: 200 });
  } catch (error) {
    console.error("VERIFY OTP API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
