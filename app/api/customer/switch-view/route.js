import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/middleware/auth';
import User from '@/models/user.model';

export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { view } = await request.json();

    if (!['CUSTOMER', 'MERCHANT'].includes(view)) {
      return NextResponse.json({ error: 'Invalid view' }, { status: 400 });
    }

    // Only allow switching to MERCHANT if user has that role
    if (view === 'MERCHANT' && user.role !== 'MERCHANT' && !user.roles?.includes('MERCHANT')) {
      return NextResponse.json({ error: 'You do not have merchant access' }, { status: 403 });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { activeView: view },
    });

    return NextResponse.json({ success: true, activeView: view });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
