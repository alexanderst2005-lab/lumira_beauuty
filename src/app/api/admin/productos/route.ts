import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

export async function POST(request: Request) {
  if (!TOKEN || !PRODUCTS_DB_ID) {
    return NextResponse.json({ error: 'Missing Notion Token or DB ID' }, { status: 500 });
  }

  try {
    const data = await request.json();
    const { name, price, category, stock, active, images, description, featured, isNew, options } = data;

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: PRODUCTS_DB_ID },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Id: { rich_text: [{ text: { content: crypto.randomUUID() } }] },
          Price: { number: Number(price) },
          Category: { select: { name: category } },
          Stock: { number: Number(stock) },
          Active: { checkbox: active },
          Destacado: { checkbox: featured || false },
          Nuevo: { checkbox: isNew || false },
          Description: { rich_text: [{ text: { content: description || '' } }] },
          Options: { rich_text: [{ text: { content: options ? JSON.stringify(options) : '[]' } }] },
          Image: {
            files: (images || []).map((url: string, i: number) => ({
              name: `image_${i}.jpg`,
              type: 'external',
              external: { url }
            }))
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error creating product');
    }

    // Invalidar caché global para que los productos aparezcan de inmediato en toda la tienda
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
