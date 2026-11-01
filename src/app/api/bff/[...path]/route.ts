import { createBff } from '@/lib/server/bff';
import { getSessionStore } from '@/lib/server/sessionStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const production = process.env.NODE_ENV === 'production';
    const origin = process.env.APP_ORIGIN || (production ? '' : new URL(request.url).origin);
    const apiURL = process.env.API_INTERNAL_URL || (production ? '' : process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7287');
    if (!origin || !apiURL || (production && (!origin.startsWith('https://') || !apiURL.startsWith('https://')))) throw new Error('Missing secure BFF configuration');
    const bff = createBff({ store: getSessionStore(), apiURL, origin: new URL(origin).origin, secure: production || origin.startsWith('https://') });
    return await bff(request, (await context.params).path);
  } catch {
    return Response.json({ message: 'Service temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export { handle as GET, handle as HEAD, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
