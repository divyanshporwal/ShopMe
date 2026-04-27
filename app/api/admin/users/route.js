import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { authorizeRoles } from "@/middleware/roles";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const admin = await getAuthUser(req);
    authorizeRoles("ADMIN")(admin);

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 403 }
    );
  }
}