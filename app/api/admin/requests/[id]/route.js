import { connectDB } from "@/lib/db";
import MerchantRequest from "@/models/merchantRequest.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
  try {
    await connectDB();

    // ✅ FIX HERE
    const { id } = await context.params;

    const { action } = await req.json();

    const request = await MerchantRequest.findById(id);

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      request.status = "APPROVED";

      await User.findByIdAndUpdate(request.userId, {
        role: "MERCHANT",
        isApproved: true,
      });

    } else if (action === "reject") {
      request.status = "REJECTED";
    }

    await request.save();

    return NextResponse.json({
      success: true,
      message: `Request ${action}d`,
    });

  } catch (err) {
    console.error("PATCH ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}