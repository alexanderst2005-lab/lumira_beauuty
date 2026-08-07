import { getAllOrdersFromNotion, getAllProductsFromNotion } from '@/data/notion';
import DashboardClient from './DashboardClient';

export const revalidate = 0; // Don't cache admin pages statically

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([
    getAllOrdersFromNotion(),
    getAllProductsFromNotion()
  ]);

  return <DashboardClient initialOrders={orders} initialProducts={products} />;
}
