import { NextResponse } from 'next/server';
import { getActiveCampaignAsync, getCampaignsAsync, getActiveDiscountsMapAsync } from '@/data/campaignsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const previewId = searchParams.get('preview');

    if (previewId) {
      const all = await getCampaignsAsync();
      const target = all.find(c => c.id === previewId);
      if (target) {
        const previewDiscounts: Record<string, any> = {};
        if (target.products) {
          target.products.forEach(p => {
            if (p.productId) previewDiscounts[p.productId] = p;
          });
        }

        return NextResponse.json({
          campaign: {
            ...target,
            status: 'active'
          },
          discounts: previewDiscounts,
          isPreview: true
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        });
      }
    }

    const active = await getActiveCampaignAsync();
    const discounts = await getActiveDiscountsMapAsync();

    return NextResponse.json({
      campaign: active,
      discounts,
      isPreview: false
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error fetching active promotional campaign:', error);
    return NextResponse.json({ campaign: null, discounts: {}, error: 'Internal server error' }, { status: 500 });
  }
}
