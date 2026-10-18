import { Metadata } from 'next';
import { getChristmasConfigAsync } from '@/data/christmasManager';
import NavidadClient from './NavidadClient';

export const metadata: Metadata = {
  title: 'Temporada Navideña | Lumira Admin',
  description: 'Control y configuración de la ambientación navideña de Lumira Beauty'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NavidadPage() {
  const initialConfig = await getChristmasConfigAsync();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <NavidadClient initialConfig={initialConfig} />
    </div>
  );
}
