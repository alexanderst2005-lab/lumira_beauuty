import { getAllOrdersFromNotion } from '@/data/notion';
import PedidosClient from './PedidosClient';

export const revalidate = 0;

export default async function PedidosPage() {
  const orders = await getAllOrdersFromNotion();
  return <PedidosClient initialOrders={orders} />;
}
