import { NextResponse } from 'next/server';
import { getActiveCampaign, readCampaigns } from '@/data/campaignsManager';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const previewId = searchParams.get('preview');

    if (previewId) {
      const all = readCampaigns();
      const target = all.find(c => c.id === previewId);
      if (target) {
        return NextResponse.json({
          campaign: {
            ...target,
            status: 'active' // Forzar visualización en preview
          },
          isPreview: true
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        });
      }
    }

    const active = getActiveCampaign();

    return NextResponse.json({
      campaign: active,
      isPreview: false
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching active promotional campaign:', error);
    return NextResponse.json({ campaign: null, error: 'Internal server error' }, { status: 500 });
  }
}
