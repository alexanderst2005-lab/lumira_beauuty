import { NextResponse } from 'next/server';
import { getChristmasConfigAsync } from '@/data/christmasManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getChristmasConfigAsync();
    return NextResponse.json(
      { config },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching christmas config:', error);
    return NextResponse.json({ error: 'Error al obtener la configuración navideña' }, { status: 500 });
  }
}
