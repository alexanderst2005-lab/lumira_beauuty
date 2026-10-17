import { Metadata } from 'next';
import { readCampaigns } from '@/data/campaignsManager';
import CampanasClient from './CampanasClient';

export const metadata: Metadata = {
  title: 'Campañas Promocionales | Lumira Admin',
  description: 'Administración de campañas promocionales y popups en Lumira Beauty'
};

export const dynamic = 'force-dynamic';

export default async function CampanasPage() {
  const initialCampaigns = readCampaigns();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <CampanasClient initialCampaigns={initialCampaigns} />
    </div>
  );
}
