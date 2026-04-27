import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { authorizeRoles } from "@/middleware/roles";
import { approveMerchant } from "@/controllers/admin.controller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const admin = await getAuthUser(req);
    authorizeRoles("ADMIN")(admin);

    const { requestId } = await req.json();

    const result = await approveMerchant(requestId);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 403 }
    );
  }
}