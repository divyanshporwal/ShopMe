import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { authorizeRoles } from "@/middleware/roles";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const admin = await getAuthUser();
    authorizeRoles("ADMIN")(admin);

    const { id: userId } = await params;
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const normalizedRole = role.toUpperCase();
    const validRoles = ["CUSTOMER", "MERCHANT", "ADMIN"];

    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Prevent admin from changing their own role
    if (userId === admin._id.toString()) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: normalizedRole } },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: `Role updated to ${normalizedRole}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
