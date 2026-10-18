import { saveCampaign, readCampaigns, getActiveCampaign } from '../src/data/campaignsManager.ts';

const camp = saveCampaign({
  title: '¡Descuentos de Temporada Lumira Beauty!',
  description: 'Descubre nuestros productos favoritos con promociones especiales por tiempo limitado.',
  promoBadge: 'Hasta 30% OFF',
  imageUrl: '',
  buttonText: 'Explorar Ofertas',
  buttonUrl: '/catalogo?ofertas=true',
  frequency: 'always',
  enabled: true,
  products: []
});

console.log('Campaign successfully published:');
console.log('ID:', camp.id);
console.log('Title:', camp.title);
console.log('Status:', camp.status);
console.log('Active Campaign Title:', getActiveCampaign()?.title);
