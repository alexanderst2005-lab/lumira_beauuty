import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  readCampaigns, 
  saveCampaign, 
  deleteCampaign, 
  toggleCampaign 
} from '@/data/campaignsManager';
import { PromotionalCampaign, CampaignFrequency } from '@/types/campaign';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

function sanitizeUrl(url?: string): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  // Permitir rutas internas relativas seguras (ej. "/#catalogo", "/producto/sk-001")
  if (trimmed.startsWith('/')) return trimmed;
  // Permitir enlaces externos https seguros
  if (trimmed.startsWith('https://')) return trimmed;
  // Si introdujo "catalogo" o "#catalogo", normalizar a "/#catalogo" o "/catalogo"
  if (trimmed.startsWith('#')) return `/${trimmed}`;
  return `/${trimmed}`;
}

export async function GET() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const campaigns = readCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching admin campaigns:', error);
    return NextResponse.json({ error: 'Error al obtener campañas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, data, id } = body;

    if (action === 'toggle' && id) {
      const updated = toggleCampaign(id);
      if (!updated) {
        return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, campaign: updated });
    }

    if (action === 'delete' && id) {
      const deleted = deleteCampaign(id);
      return NextResponse.json({ success: deleted });
    }

    if (action === 'save' && data) {
      // Validaciones
      const title = (data.title || '').trim();
      if (!title) {
        return NextResponse.json({ error: 'El título de la campaña es obligatorio' }, { status: 400 });
      }

      const validFrequencies: CampaignFrequency[] = ['once_per_session', 'every_24_hours', 'always'];
      const frequency: CampaignFrequency = validFrequencies.includes(data.frequency) 
        ? data.frequency 
        : 'once_per_session';

      const buttonUrl = sanitizeUrl(data.buttonUrl);

      const campaignPayload: Partial<PromotionalCampaign> = {
        id: data.id,
        title,
        description: (data.description || '').trim(),
        promoBadge: (data.promoBadge || '').trim(),
        imageUrl: (data.imageUrl || '').trim(),
        buttonText: (data.buttonText || '').trim(),
        buttonUrl,
        frequency,
        enabled: Boolean(data.enabled),
        startDate: data.startDate || '',
        endDate: data.endDate || ''
      };

      const saved = saveCampaign(campaignPayload);
      return NextResponse.json({ success: true, campaign: saved });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in admin campaigns API:', error);
    return NextResponse.json({ error: error.message || 'Error en el servidor' }, { status: 500 });
  }
}
