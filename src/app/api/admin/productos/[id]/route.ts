import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

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
    const data = await request.json();
    const { name, price, category, stock, active, image, description, featured, isNew } = data;

    const properties: any = {};
    if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] };
    if (price !== undefined) properties.Price = { number: Number(price) };
    if (category !== undefined) properties.Category = { select: { name: category } };
    if (stock !== undefined) properties.Stock = { number: Number(stock) };
    if (active !== undefined) properties.Active = { checkbox: active };
    if (featured !== undefined) properties.Destacado = { checkbox: featured };
    if (isNew !== undefined) properties.Nuevo = { checkbox: isNew };
    if (description !== undefined) properties.Description = { rich_text: [{ text: { content: description } }] };
    
    if (image !== undefined) {
      properties.Image = {
        files: image ? [
          {
            name: 'image.jpg',
            type: 'external',
            external: { url: image }
          }
        ] : []
      };
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
      throw new Error('Error updating product');
    }

    // Invalidar caché global
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error: any) {
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
    const response = await fetch(`https://api.notion.com/v1/blocks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (!response.ok) {
      throw new Error('Error deleting product');
    }

    // Invalidar caché global
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
