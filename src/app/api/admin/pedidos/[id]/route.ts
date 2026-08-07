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
    const { status } = await request.json();

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        properties: {
          Status: { select: { name: status } }
        }
      })
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
