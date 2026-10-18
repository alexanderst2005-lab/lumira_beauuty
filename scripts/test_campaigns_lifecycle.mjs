import { 
  readCampaigns, 
  saveCampaign, 
  deleteCampaign, 
  getActiveCampaign, 
  getActiveDiscountsMap 
} from '../src/data/campaignsManager.ts';

async function testCampaignLifecycle() {
  console.log('=== TEST 1: Initial state ===');
  const initial = readCampaigns();
  console.log('Initial campaigns count:', initial.length);

  console.log('\n=== TEST 2: Create campaign with selected product discounts ===');
  const sampleProducts = [
    {
      productId: 'prod-test-1',
      productName: 'Labial Matte Test',
      productImage: '/img/test1.jpg',
      basePrice: 50000,
      discountType: 'percentage',
      discountValue: 20,
      discountPrice: 40000,
      discountPercent: 20,
      savings: 10000
    },
    {
      productId: 'prod-test-2',
      productName: 'Serum Facial Test',
      productImage: '/img/test2.jpg',
      basePrice: 80000,
      discountType: 'fixed_price',
      discountValue: 60000,
      discountPrice: 60000,
      discountPercent: 25,
      savings: 20000
    }
  ];

  const created = saveCampaign({
    title: 'Campaña Super Descuentos',
    description: 'Aprovecha ofertas únicas en productos seleccionados',
    promoBadge: '20% y 25% OFF',
    buttonText: 'Ver Descuentos',
    buttonUrl: '/catalogo?ofertas=true',
    frequency: 'always',
    enabled: true,
    startDate: new Date(Date.now() - 60000).toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    products: sampleProducts
  });

  console.log('Campaign created with ID:', created.id);
  console.log('Products saved in campaign:', created.products?.length);

  if (!created.products || created.products.length !== 2) {
    throw new Error('FAILED: Products were not saved in campaign!');
  }
  console.log('PASS: 2 products saved with discounts:', created.products);

  console.log('\n=== TEST 3: Active campaign & active discounts map ===');
  const active = getActiveCampaign();
  console.log('Active campaign title:', active?.title);
  if (!active || active.id !== created.id) {
    throw new Error('FAILED: Active campaign not found');
  }

  const discountsMap = getActiveDiscountsMap();
  console.log('Active discounts map keys:', Object.keys(discountsMap));
  if (!discountsMap['prod-test-1'] || discountsMap['prod-test-1'].discountPrice !== 40000) {
    throw new Error('FAILED: prod-test-1 discountPrice not 40000');
  }
  if (!discountsMap['prod-test-2'] || discountsMap['prod-test-2'].discountPrice !== 60000) {
    throw new Error('FAILED: prod-test-2 discountPrice not 60000');
  }
  console.log('PASS: Active discounts map correctly calculated');

  console.log('\n=== TEST 4: Delete campaign and ensure NO popup or active campaign remains ===');
  const deleted = deleteCampaign(created.id);
  console.log('Delete result:', deleted);

  const afterDeleteAll = readCampaigns();
  console.log('Campaigns count after delete:', afterDeleteAll.length);
  if (afterDeleteAll.some(c => c.id === created.id)) {
    throw new Error('FAILED: Deleted campaign still exists in readCampaigns()');
  }

  const activeAfterDelete = getActiveCampaign();
  console.log('Active campaign after delete (must be null):', activeAfterDelete);
  if (activeAfterDelete !== null) {
    throw new Error('FAILED: Active campaign still returned after deletion!');
  }

  const discountsAfterDelete = getActiveDiscountsMap();
  console.log('Discounts map after delete (must be empty):', discountsAfterDelete);
  if (Object.keys(discountsAfterDelete).length !== 0) {
    throw new Error('FAILED: Discounts map not empty after deletion!');
  }

  console.log('\nALL CAMPAIGN LIFECYCLE AND PRODUCT DISCOUNT TESTS PASSED WITH 100% SUCCESS!');
}

testCampaignLifecycle().catch(err => {
  console.error('Lifecycle test error:', err);
  process.exit(1);
});
