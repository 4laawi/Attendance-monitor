import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Use getUser() instead of getSession() for more reliable server-side validation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = req.nextUrl.pathname === '/login';
  const isRegisterRoute = req.nextUrl.pathname === '/register';

  // Protect all /dashboard routes
  if (isDashboardRoute) {
    if (!user) {
      const loginUrl = new URL('/login', req.url);
      // Preserve the intended destination
      loginUrl.searchParams.set('next', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from /login and /register to /dashboard
  if ((isLoginRoute || isRegisterRoute) && user) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login', '/register'],
};
