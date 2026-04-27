import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { authorizeRoles } from "@/middleware/roles";
import MerchantRequest from "@/models/merchantRequest.model";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const admin = await getAuthUser(req);
    authorizeRoles("ADMIN")(admin);

    const requests = await MerchantRequest.find()
      .populate("userId", "name email role isApproved")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 403 }
    );
  }
}