import { NextResponse } from 'next/server';
import { validateItemPrice } from '@/data/campaignsManager';
import {
  allocateUniqueOrderNumber,
  releaseOrderReservation,
  computeOrderIdempotencyKey,
  checkRecentIdempotency,
  recordOrderIdempotency
} from '@/utils/orderNumber';
import { sendOrderConfirmationEmail } from '@/utils/brevo';

const TOKEN = process.env.NOTION_SECRET;
const ORDERS_DB_ID = process.env.NOTION_ORDERS_DB;

export async function POST(request: Request) {
  if (!ORDERS_DB_ID || !TOKEN) {
    return NextResponse.json({ error: 'Missing DB ID or Token' }, { status: 500 });
  }

  try {
    const data = await request.json();
    const { formData, items, total, clientToken } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!formData?.nombre || !formData?.whatsapp) {
      return NextResponse.json({ error: 'Missing required customer details' }, { status: 400 });
    }

    // Validación segura de precios en el servidor según campañas activas
    let backendCalculatedTotal = 0;
    const validatedItems = items.map((item: any) => {
      const prodId = item.product?.id || item.id || '';
      const basePrice = Number(item.product?.price || item.price) || 0;
      const originalPrice = item.product?.originalPrice ? Number(item.product.originalPrice) : undefined;
      const { finalPrice } = validateItemPrice(prodId, basePrice, originalPrice);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      backendCalculatedTotal += finalPrice * qty;
      return {
        ...item,
        finalPrice,
        quantity: qty
      };
    });

    // Protección de Idempotencia: si el cliente reintenta o hace doble clic rápido,
    // retornamos el pedido ya creado sin duplicar en la base de datos
    const idempotencyKey = computeOrderIdempotencyKey({
      formData,
      total: backendCalculatedTotal,
      items: validatedItems,
      clientToken
    });

    const existingOrder = checkRecentIdempotency(idempotencyKey);
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderNumber: existingOrder.orderNumber,
        orderId: existingOrder.orderId,
        isDuplicate: true
      });
    }

    // Crear string de productos consolidado con sus variantes en la misma línea
    const productsString = validatedItems.map((item: any) => {
      const productName = item.product?.name || item.name || 'Producto';
      const variants: string[] = [];
      if (item.selectedTone?.name) variants.push(`Tono: ${item.selectedTone.name}`);
      else if (typeof item.selectedTone === 'string') variants.push(`Tono: ${item.selectedTone}`);
      if (item.selectedOptions) {
         Object.entries(item.selectedOptions).forEach(([optName, optVal]: [string, any]) => {
            const valName = optVal?.name || optVal;
            if (valName) variants.push(`${optName}: ${valName}`);
         });
      }
      const variantText = variants.length > 0 ? ` (${variants.join(', ')})` : '';
      return `${item.quantity}x ${productName}${variantText}`;
    }).join('\n');

    // Mantener también tonesString para la columna Tones si es necesaria
    const tonesString = items.map((item: any) => {
      const variants: string[] = [];
      if (item.selectedTone) variants.push(`Tono: ${item.selectedTone.name}`);
      if (item.selectedOptions) {
         Object.entries(item.selectedOptions).forEach(([optName, optVal]: [string, any]) => {
            variants.push(`${optName}: ${optVal.name}`);
         });
      }
      if (variants.length > 0) return `${item.product.name}: ${variants.join(', ')}`;
      return null;
    }).filter(Boolean).join('\n');

    const today = new Date();

    // Asignación segura y única de número de pedido: LB-XXXX
    // Bloquea concurrencia, comprueba en la base de datos Notion y reintenta si existiera
    const orderNumber = await allocateUniqueOrderNumber(TOKEN, ORDERS_DB_ID);

    let pageResult: any = null;
    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: ORDERS_DB_ID },
          properties: {
            Name: { title: [{ text: { content: formData.nombre } }] },
            WhatsApp: { phone_number: formData.whatsapp },
            City: { rich_text: [{ text: { content: formData.ciudad || '' } }] },
            Address: { rich_text: [{ text: { content: formData.direccion || '' } }] },
            Neighborhood: { rich_text: [{ text: { content: formData.barrio || '' } }] },
            Products: { rich_text: [{ text: { content: productsString } }] },
            Tones: { rich_text: [{ text: { content: tonesString } }] },
            Total: { number: backendCalculatedTotal },
            Status: { select: { name: 'Pendiente' } },
            Date: { date: { start: today.toISOString() } },
            OrderNumber: { rich_text: [{ text: { content: orderNumber } }] },
            ...(formData.email ? { Email: { email: formData.email.trim() } } : {})
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error inserting order into Notion');
      }

      pageResult = await response.json();
    } catch (dbError) {
      // Si la inserción falló, liberar la reserva de memoria para permitir su uso posterior
      releaseOrderReservation(orderNumber);
      throw dbError;
    }

    const orderId = pageResult?.id || '';

    // Registrar en caché de idempotencia
    recordOrderIdempotency(idempotencyKey, orderNumber, orderId);

    // Enviar correo de confirmación de pedido vía Brevo de forma asíncrona
    if (formData.email) {
      sendOrderConfirmationEmail({
        orderNumber,
        customerName: formData.nombre,
        customerEmail: formData.email,
        customerPhone: formData.whatsapp,
        city: formData.ciudad || '',
        address: formData.direccion || '',
        neighborhood: formData.barrio || '',
        items: validatedItems.map((item: any) => ({
          name: item.product?.name || item.name || 'Producto',
          quantity: item.quantity,
          price: item.finalPrice || item.price || 0,
          variant: item.selectedTone?.name || item.selectedTone || (item.selectedOptions ? Object.values(item.selectedOptions).map((v: any) => v?.name || v).join(', ') : undefined)
        })),
        total: backendCalculatedTotal
      }).catch(emailErr => {
        console.error('[Brevo Error] No se pudo enviar el correo de confirmación:', emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId
    });
  } catch (error: any) {
    console.error('Error creating order in Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
