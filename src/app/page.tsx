import HeroBanner from '@/components/home/HeroBanner';
import Categories from '@/components/home/Categories';
import EditorialSection from '@/components/home/EditorialSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import StoreBenefits from '@/components/home/StoreBenefits';
import InstagramSection from '@/components/home/InstagramSection';
import FAQSection from '@/components/home/FAQSection';
import { getAllProductsFromNotion, getStoreConfig } from '@/data/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const products = await getAllProductsFromNotion();
  const config = await getStoreConfig();
  
  return (
    <>
      <HeroBanner config={config} />
      <Categories />
      <EditorialSection />
      <FeaturedProducts initialProducts={products} />
      <StoreBenefits />
      <InstagramSection />
      <FAQSection />
    </>
  );
}
