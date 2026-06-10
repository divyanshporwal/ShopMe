import { NextResponse } from "next/server";
import { getAuthUser } from "@/middleware/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";

export async function GET(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser();
    const user = await User.findById(authUser._id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ savedAddresses: user.savedAddresses || [] });
  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const authUser = await getAuthUser();
    const address = await req.json();

    const user = await User.findById(authUser._id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.savedAddresses)) {
      user.savedAddresses = [];
    }

    if (user.savedAddresses.length >= 5) {
      user.savedAddresses.shift();
    }
    user.savedAddresses.push(address);

    await user.save();
    return NextResponse.json({ success: true, savedAddresses: user.savedAddresses });
  } catch (error) {
    console.error("POST ADDRESS ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
