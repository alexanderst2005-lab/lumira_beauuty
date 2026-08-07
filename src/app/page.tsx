import HeroBanner from '@/components/home/HeroBanner';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { getAllProductsFromNotion } from '@/data/notion';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getAllProductsFromNotion();
  
  return (
    <>
      <HeroBanner />
      <Categories />
      <FeaturedProducts initialProducts={products} />
    </>
  );
}
