import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    return NextResponse.json(
      {
        message: "Use /api/payment/verify for Stripe payment verification",
        session_id: body?.session_id,
      },
      { status: 410 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
