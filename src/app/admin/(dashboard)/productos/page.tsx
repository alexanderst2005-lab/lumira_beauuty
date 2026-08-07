import { getAllProductsFromNotion } from '@/data/notion';
import ProductosClient from './ProductosClient';

export const revalidate = 0;

export default async function ProductosPage() {
  const products = await getAllProductsFromNotion();
  return <ProductosClient initialProducts={products} />;
}
