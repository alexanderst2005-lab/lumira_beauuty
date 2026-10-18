import { NextResponse } from 'next/server';
import { sendOrderStatusEmail } from '@/utils/brevo';

const TOKEN = process.env.NOTION_SECRET;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!TOKEN) {
    return NextResponse.json({ error: 'Missing Token' }, { status: 500 });
  }

  try {
    const { status, inTrash, shippingCompany, trackingNumber } = await request.json();

    const properties: any = {};
    if (status !== undefined) properties.Status = { select: { name: status } };
    if (inTrash !== undefined) properties['En Papelera'] = { checkbox: inTrash };
    if (shippingCompany !== undefined) {
      properties.ShippingCompany = { rich_text: [{ text: { content: shippingCompany || '' } }] };
    }
    if (trackingNumber !== undefined) {
      properties.TrackingNumber = { rich_text: [{ text: { content: trackingNumber || '' } }] };
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({ properties })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating order');
    }

    const pageData = await response.json();

    // Enviar notificación por correo con Brevo ante cambio de estado
    if (status !== undefined) {
      const customerEmail = pageData.properties?.Email?.email;
      const customerName = pageData.properties?.Name?.title?.[0]?.plain_text || 'Cliente';
      const orderNumber = pageData.properties?.OrderNumber?.rich_text?.[0]?.plain_text || id.slice(0, 8);
      const total = pageData.properties?.Total?.number || 0;
      const sCompany = shippingCompany !== undefined ? shippingCompany : (pageData.properties?.ShippingCompany?.rich_text?.[0]?.plain_text || '');
      const tNumber = trackingNumber !== undefined ? trackingNumber : (pageData.properties?.TrackingNumber?.rich_text?.[0]?.plain_text || '');

      if (customerEmail) {
        sendOrderStatusEmail({
          orderNumber,
          customerName,
          customerEmail,
          status,
          shippingCompany: sCompany,
          trackingNumber: tNumber,
          total
        }).catch(err => {
          console.error('[Brevo Error] No se pudo enviar el correo de cambio de estado:', err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating order in Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!TOKEN) {
    return NextResponse.json({ error: 'Missing Token' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    let response;
    if (permanent) {
      // Hard delete (Archive page in Notion)
      response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ archived: true })
      });
    } else {
      // Soft delete (Mover a papelera)
      response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          properties: {
            'En Papelera': { checkbox: true }
          }
        })
      });
    }

    if (!response.ok) {
      throw new Error('Error deleting order');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
