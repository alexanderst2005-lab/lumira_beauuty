import { getAllOrdersFromNotion } from '@/data/notion';
import VentasClient from './VentasClient';

export const revalidate = 0;

export default async function VentasPage() {
  const orders = await getAllOrdersFromNotion();
  return <VentasClient initialOrders={orders} />;
}
