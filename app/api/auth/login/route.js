import connectDB from '@/config/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, role } = await request.json();

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (role && user.role !== role) {
      return Response.json({ message: 'Role mismatch' }, { status: 403 });
    }

    const token = signToken(user._id);
    return Response.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
