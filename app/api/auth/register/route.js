import connectDB from '@/config/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();

    const validRoles = ['citizen', 'admin', 'maintenance_staff', 'event_organizer'];
    if (!validRoles.includes(role)) {
      return Response.json({ message: 'Invalid role' }, { status: 400 });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return Response.json({ message: 'Email already registered' }, { status: 400 });
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    return Response.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
