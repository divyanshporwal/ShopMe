import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/roles';
import User from '@/models/user.model';

export async function GET(request) {
  try {
    await connectDB();
    const admin = await getAuthUser();
    authorizeRoles('ADMIN')(admin);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const requests = await User.find({
      'merchantRequest.status': status,
    })
      .select('name email createdAt merchantRequest')
      .sort({ 'merchantRequest.requestedAt': -1 })
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
