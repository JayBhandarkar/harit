import connectDB from '@/config/db';
import SOS from '@/models/SOS';
import { requireRole } from '@/middleware/auth';

// POST /api/sos/trigger — Citizen triggers SOS
export async function POST(request) {
  const result = await requireRole(request, 'citizen');
  if (result.error) return result.error;

  try {
    await connectDB();
    const { message, lat, lng, address } = await request.json();

    const sos = await SOS.create({
      citizen:     result.user._id,
      citizenName: result.user.name,
      message:     message || 'Emergency! I need immediate help.',
      location:    { lat, lng, address: address || 'Location not available' },
    });

    return Response.json({ sos }, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
