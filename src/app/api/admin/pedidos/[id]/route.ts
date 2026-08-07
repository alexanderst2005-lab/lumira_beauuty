import { NextResponse } from 'next/server';

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
    const { status, inTrash } = await request.json();

    const properties: any = {};
    if (status !== undefined) properties.Status = { select: { name: status } };
    if (inTrash !== undefined) properties['En Papelera'] = { checkbox: inTrash };

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
      // Hard delete (Archive block)
      response = await fetch(`https://api.notion.com/v1/blocks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Notion-Version': '2022-06-28'
        }
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
