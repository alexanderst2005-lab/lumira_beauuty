'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { products, getProductById } from '@/data/products';
import ProductDetail from '@/components/product/ProductDetail';

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  // Get related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
