import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/middleware/auth';
import { authorizeRoles } from '@/middleware/roles';
import User from '@/models/user.model';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const admin = await getAuthUser();
    authorizeRoles('ADMIN')(admin);

    const { id: userId } = await params;
    const { action, rejectionReason } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateData = {
      'merchantRequest.status':    action === 'approve' ? 'approved' : 'rejected',
      'merchantRequest.reviewedAt': new Date(),
      'merchantRequest.reviewedBy': admin._id,
    };

    if (action === 'approve') {
      // Upgrade primary role to MERCHANT and add to roles array
      updateData.role = 'MERCHANT';
      updateData.isApproved = true;
      updateData.activeView = 'MERCHANT';
    }

    if (action === 'reject' && rejectionReason) {
      updateData['merchantRequest.rejectionReason'] = rejectionReason;
    }

    // Use $addToSet separately to push 'MERCHANT' into roles array
    const updateOp = action === 'approve'
      ? { $set: updateData, $addToSet: { roles: 'MERCHANT' } }
      : { $set: updateData };

    const user = await User.findByIdAndUpdate(userId, updateOp, { new: true })
      .select('name email role merchantRequest');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
      message: action === 'approve'
        ? `${user.name} is now a merchant`
        : 'Request rejected',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
