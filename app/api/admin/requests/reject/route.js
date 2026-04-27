import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { authorizeRoles } from "@/middleware/roles";
import MerchantRequest from "@/models/merchantRequest.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const admin = await getAuthUser(req);
    authorizeRoles("ADMIN")(admin);

    const { requestId } = await req.json();
    const request = await MerchantRequest.findById(requestId);
    if (!request) throw new Error("Request not found");

    request.status = "REJECTED";
    await request.save();

    return NextResponse.json({ success: true, request });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 403 }
    );
  }
}