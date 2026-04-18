import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import connectDB from '../config/db.js';

/**
 * Extract and verify the authenticated user from a Next.js Request object.
 * Returns the user document (minus password) or null if not authenticated.
 */
export async function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;

  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns a Response if unauthorized, or the user if OK.
 */
export async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return { error: Response.json({ message: 'Not authorized' }, { status: 401 }) };
  }
  return { user };
}

/**
 * Require authentication + specific role(s).
 */
export async function requireRole(request, ...roles) {
  const result = await requireAuth(request);
  if (result.error) return result;

  if (!roles.includes(result.user.role)) {
    return { error: Response.json({ message: 'Access denied' }, { status: 403 }) };
  }
  return result;
}
