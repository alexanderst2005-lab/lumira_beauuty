import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Solo proteger las rutas que empiezan con /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Si la ruta es el login, permitir acceso
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Verificar si existe la cookie de sesión
    const adminSession = request.cookies.get('admin_session');

    // Si no hay sesión válida, redirigir al login
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
