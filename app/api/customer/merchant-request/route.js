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

    // Already a merchant
    if (user.role === 'MERCHANT') {
      return NextResponse.json(
        { error: 'You are already a merchant' },
        { status: 400 }
      );
    }

    // Already pending
    if (user.merchantRequest?.status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending request' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      businessName,
      businessType,
      businessEmail,
      businessPhone,
      businessAddress,
      description,
    } = body;

    // Basic validation
    if (!businessName || !businessType || !businessEmail || !businessPhone || !businessAddress || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        'merchantRequest.status':          'pending',
        'merchantRequest.requestedAt':     new Date(),
        'merchantRequest.businessName':    businessName,
        'merchantRequest.businessType':    businessType,
        'merchantRequest.businessEmail':   businessEmail,
        'merchantRequest.businessPhone':   businessPhone,
        'merchantRequest.businessAddress': businessAddress,
        'merchantRequest.description':     description,
        'merchantRequest.rejectionReason': null,
        'merchantRequest.reviewedAt':      null,
        'merchantRequest.reviewedBy':      null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Merchant request submitted successfully',
    });
  } catch (error) {
    console.error('[MERCHANT REQUEST] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
