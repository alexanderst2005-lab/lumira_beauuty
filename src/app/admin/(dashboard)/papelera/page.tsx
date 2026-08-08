import { getAllProductsFromNotion, getAllOrdersFromNotion } from '@/data/notion';
import PapeleraClient from './PapeleraClient';

export const dynamic = 'force-dynamic';

export default async function PapeleraPage() {
  const allProducts = await getAllProductsFromNotion(true);
  const allOrders = await getAllOrdersFromNotion(true);

  const trashedProducts = allProducts.filter(p => p.inTrash);
  const trashedOrders = allOrders.filter(o => o.inTrash);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PapeleraClient initialProducts={trashedProducts} initialOrders={trashedOrders} />
    </div>
  );
}
