import { getAllOrdersFromNotion, getAllProductsFromNotion } from '@/data/notion';
import PedidosClient from './PedidosClient';

export const revalidate = 0;

export default async function PedidosPage() {
  const [orders, products] = await Promise.all([
    getAllOrdersFromNotion(),
    getAllProductsFromNotion()
  ]);
  return <PedidosClient initialOrders={orders} products={products} />;
}
