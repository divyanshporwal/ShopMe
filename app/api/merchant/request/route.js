import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { createMerchantRequest } from "@/controllers/merchant.controller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthUser(req);

    const request = await createMerchantRequest(user._id);

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}