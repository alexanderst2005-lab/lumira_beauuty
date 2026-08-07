import { NextResponse } from 'next/server';
import { getAllOrdersFromNotion } from '@/data/notion';

export const revalidate = 0; // Don't cache this route

export async function GET() {
  try {
    const orders = await getAllOrdersFromNotion();
    const pendingOrders = orders.filter(o => o.status === 'Pendiente');
    
    return NextResponse.json({ count: pendingOrders.length });
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
