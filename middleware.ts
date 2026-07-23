import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests
const RATE_WINDOW = 60_000; // 1 minute in ms

function getRateLimitKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Rate limiting for all routes
  const clientKey = getRateLimitKey(req);
  if (!checkRateLimit(clientKey)) {
    return new NextResponse(JSON.stringify({ error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Security headers
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  // Auth check for admin pages and admin API routes
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isProtectedApi = pathname.startsWith('/api/') && (
    pathname.startsWith('/api/ventas')
    || pathname.startsWith('/api/gastos')
    || pathname.startsWith('/api/cortes-caja')
    || pathname.startsWith('/api/devoluciones')
    || pathname.startsWith('/api/backup')
    || pathname.startsWith('/api/dashboard')
    || pathname.startsWith('/api/negocio')
  );

  if (isAdminPage || isProtectedApi) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              res.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isProtectedApi) {
          return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else if (isProtectedApi) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    } else {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
