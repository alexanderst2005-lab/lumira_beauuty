import { Suspense } from 'react';
import { getAllProductsFromNotion } from '@/data/notion';
import CatalogoClient from './CatalogoClient';

export const dynamic = 'force-dynamic';
// O alternativamente, usar revalidate = 10;
// export const revalidate = 10;

export default async function CatalogoPage() {
  const products = await getAllProductsFromNotion();

  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-txt-secondary font-medium">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        Cargando catálogo desde Notion...
      </div>
    }>
      <CatalogoClient initialProducts={products} />
    </Suspense>
  );
}
