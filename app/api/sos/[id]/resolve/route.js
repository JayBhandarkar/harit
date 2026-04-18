import connectDB from '@/config/db';
import SOS from '@/models/SOS';
import { requireRole } from '@/middleware/auth';

// PATCH /api/sos/[id]/resolve
export async function PATCH(request, { params }) {
  const result = await requireRole(request, 'admin', 'maintenance_staff');
  if (result.error) return result.error;

  try {
    await connectDB();
    const { id } = await params;
    const sos = await SOS.findByIdAndUpdate(
      id,
      { status: 'resolved', resolvedBy: result.user._id, updatedAt: new Date() },
      { new: true }
    );

    if (!sos) {
      return Response.json({ message: 'SOS alert not found' }, { status: 404 });
    }

    return Response.json({ sos });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
