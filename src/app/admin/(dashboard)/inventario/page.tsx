import { getAllProductsFromNotion } from '@/data/notion';
import InventarioClient from './InventarioClient';

export const revalidate = 0;

export default async function InventarioPage() {
  const products = await getAllProductsFromNotion();
  return <InventarioClient initialProducts={products} />;
}
