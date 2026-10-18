import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getChristmasConfigAsync, saveChristmasConfigAsync } from '@/data/christmasManager';
import { ChristmasConfig } from '@/types/christmas';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const config = await getChristmasConfigAsync();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error in GET /api/admin/christmas:', error);
    return NextResponse.json({ error: 'Error al consultar la configuración navideña' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Datos de configuración inválidos' }, { status: 400 });
    }

    const currentConfig = await getChristmasConfigAsync();
    const updatedConfig: ChristmasConfig = {
      ...currentConfig,
      ...body,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveChristmasConfigAsync(updatedConfig);

    // Revalidar rutas para propagar instantáneamente
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/catalogo');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, config: saved });
  } catch (error) {
    console.error('Error in PATCH /api/admin/christmas:', error);
    return NextResponse.json({ error: 'Error al actualizar la configuración navideña' }, { status: 500 });
  }
}
