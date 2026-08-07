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
    const { name, price, category, stock, active, images, description, featured, isNew, inTrash, options } = data;

    const properties: any = {};
    if (name !== undefined) properties.Name = { title: [{ text: { content: name } }] };
    if (price !== undefined) properties.Price = { number: Number(price) };
    if (category !== undefined) properties.Category = { select: { name: category } };
    if (stock !== undefined) properties.Stock = { number: Number(stock) };
    if (active !== undefined) properties.Active = { checkbox: active };
    if (featured !== undefined) properties.Destacado = { checkbox: featured };
    if (isNew !== undefined) properties.Nuevo = { checkbox: isNew };
    if (inTrash !== undefined) properties['En Papelera'] = { checkbox: inTrash };
    if (description !== undefined) properties.Description = { rich_text: [{ text: { content: description } }] };
    if (options !== undefined) properties.Options = { rich_text: [{ text: { content: JSON.stringify(options) } }] };
    
    if (images !== undefined) {
      properties.Image = {
        files: (images || []).map((url: string, i: number) => ({
          name: `image_${i}.jpg`,
          type: 'external',
          external: { url }
        }))
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
      throw new Error('Error deleting product');
    }

    // Invalidar caché global
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
