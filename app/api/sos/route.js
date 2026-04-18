import connectDB from '@/config/db';
import SOS from '@/models/SOS';
import { requireRole } from '@/middleware/auth';

// GET /api/sos — Get all SOS alerts (admin + maintenance)
export async function GET(request) {
  const result = await requireRole(request, 'admin', 'maintenance_staff');
  if (result.error) return result.error;

  try {
    await connectDB();
    const alerts = await SOS.find().sort({ createdAt: -1 }).limit(50);
    return Response.json({ alerts });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
