import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAllOrdersFromNotion } from '@/data/notion';

const TOKEN = process.env.NOTION_SECRET;

export async function DELETE(request: Request, { params }: { params: Promise<{ whatsapp: string }> }) {
  const { whatsapp } = await params;
  
  if (!TOKEN) return NextResponse.json({ error: 'Missing Token' }, { status: 500 });
  
  try {
    const orders = await getAllOrdersFromNotion();
    const customerOrders = orders.filter(o => o.whatsapp === whatsapp);
    
    if (customerOrders.length === 0) return NextResponse.json({ success: true, message: 'No orders found' });
    
    for (const order of customerOrders) {
      const response = await fetch(`https://api.notion.com/v1/blocks/${order.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Notion-Version': '2022-06-28'
        }
      });
      if (!response.ok) {
        console.error('Failed to delete order', order.id);
      }
    }
    
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, deletedCount: customerOrders.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
