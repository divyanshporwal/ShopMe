import { connectDB } from "@/lib/db";
import { registerUser } from "@/controllers/auth.controller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const user = await registerUser(body);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}