import { Metadata } from 'next';
import { getCampaignsAsync } from '@/data/campaignsManager';
import { getAllProductsFromNotion } from '@/data/notion';
import CampanasClient from './CampanasClient';

export const metadata: Metadata = {
  title: 'Campañas Promocionales | Lumira Admin',
  description: 'Administración de campañas promocionales y popups en Lumira Beauty'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CampanasPage() {
  const [initialCampaigns, availableProducts] = await Promise.all([
    getCampaignsAsync(),
    getAllProductsFromNotion()
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <CampanasClient 
        initialCampaigns={initialCampaigns} 
        availableProducts={availableProducts}
      />
    </div>
  );
}
