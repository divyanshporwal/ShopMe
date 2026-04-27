import { NextResponse } from "next/server";
import { getAuthUser } from "@/middleware/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}