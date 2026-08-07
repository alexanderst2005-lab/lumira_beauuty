

import { notFound } from 'next/navigation';
import { getAllProductsFromNotion } from '@/data/notion';
import ProductDetail from '@/components/product/ProductDetail';

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const allProducts = await getAllProductsFromNotion();
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  // Get related products (same category, excluding current)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
