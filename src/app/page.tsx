import HeroBanner from '@/components/home/HeroBanner';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { getAllProductsFromNotion, getStoreConfig } from '@/data/notion';

export const revalidate = 3600;

export default async function Home() {
  const products = await getAllProductsFromNotion();
  const config = await getStoreConfig();
  
  return (
    <>
      <HeroBanner config={config} />
      <Categories />
      <FeaturedProducts initialProducts={products} />
    </>
  );
}
