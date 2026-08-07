import { getAllOrdersFromNotion } from '@/data/notion';
import ClientesClient from './ClientesClient';

export const revalidate = 0;

export default async function ClientesPage() {
  const orders = await getAllOrdersFromNotion();
  return <ClientesClient orders={orders} />;
}
