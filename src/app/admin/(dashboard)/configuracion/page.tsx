import { getStoreConfig } from '@/data/notion';
import ConfigClient from './ConfigClient';

export default async function ConfiguracionPage() {
  const config = await getStoreConfig();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ConfigClient initialConfig={config} />
    </div>
  );
}
