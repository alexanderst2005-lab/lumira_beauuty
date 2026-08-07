import { NextResponse } from 'next/server';
import { getAllOrdersFromNotion } from '@/data/notion';

export async function GET() {
  try {
    const orders = await getAllOrdersFromNotion(false);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
