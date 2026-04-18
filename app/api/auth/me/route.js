import { requireAuth } from '@/middleware/auth';

export async function GET(request) {
  const result = await requireAuth(request);
  if (result.error) return result.error;

  return Response.json({ user: result.user });
}
