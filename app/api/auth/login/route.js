import { connectDB } from "@/lib/db";
import { loginUser } from "@/controllers/auth.controller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { token, user } = await loginUser(body);

    const response = NextResponse.json({ user });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}