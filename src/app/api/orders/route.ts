import { NextResponse } from 'next/server';

const TOKEN = process.env.NOTION_SECRET;
const ORDERS_DB_ID = process.env.NOTION_ORDERS_DB;

export async function POST(request: Request) {
  if (!ORDERS_DB_ID || !TOKEN) {
    return NextResponse.json({ error: 'Missing DB ID or Token' }, { status: 500 });
  }

  try {
    const data = await request.json();
    const { formData, items, total } = data;

    // Crear string de productos y tonos
    const productsString = items.map((item: any) => `${item.quantity}x ${item.product.name}`).join('\n');
    const tonesString = items
      .filter((item: any) => item.selectedTone)
      .map((item: any) => `${item.product.name}: ${item.selectedTone.name}`)
      .join('\n');

    // Generate Order Number
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    let todaysOrders = 0;
    try {
      const countResponse = await fetch(`https://api.notion.com/v1/databases/${ORDERS_DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          filter: {
            property: 'Date',
            date: {
              on_or_after: todayStr
            }
          }
        })
      });
      if (countResponse.ok) {
        const countData = await countResponse.json();
        todaysOrders = countData.results.length;
      }
    } catch (err) {
      console.error('Error counting today orders:', err);
    }

    const nextNumber = (todaysOrders + 1).toString().padStart(3, '0');
    const orderNumber = `LUM-${todayStr.replace(/-/g, '')}-${nextNumber}`;

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
          City: { rich_text: [{ text: { content: formData.ciudad } }] },
          Address: { rich_text: [{ text: { content: formData.direccion } }] },
          Neighborhood: { rich_text: [{ text: { content: formData.barrio || '' } }] },
          Products: { rich_text: [{ text: { content: productsString } }] },
          Tones: { rich_text: [{ text: { content: tonesString } }] },
          Total: { number: total },
          Status: { select: { name: 'Pendiente' } },
          Date: { date: { start: today.toISOString() } },
          OrderNumber: { rich_text: [{ text: { content: orderNumber } }] }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error inserting order');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating order in Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
