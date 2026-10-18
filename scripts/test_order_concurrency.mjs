import fs from 'fs';

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const TOKEN = env.NOTION_SECRET;
const DB_ID = env.NOTION_ORDERS_DB;

// Import our allocation functions
import {
  allocateUniqueOrderNumber,
  computeOrderIdempotencyKey,
  checkRecentIdempotency,
  recordOrderIdempotency
} from '../src/utils/orderNumber.ts';

async function testConcurrency() {
  console.log('--- TEST 1: SIMULTANEOUS CONCURRENT ALLOCATIONS ---');
  const CONCURRENT_REQUESTS = 10;
  console.log(`Launching ${CONCURRENT_REQUESTS} simultaneous order number allocations...`);

  const startTime = Date.now();
  const promises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(allocateUniqueOrderNumber(TOKEN, DB_ID));
  }

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;
  console.log(`All ${CONCURRENT_REQUESTS} allocations completed in ${duration}ms:`, results);

  // Validate format
  const invalidFormat = results.filter(r => !/^LB-\d{4}$/.test(r));
  if (invalidFormat.length > 0) {
    throw new Error(`Format validation failed: ${invalidFormat.join(', ')}`);
  }
  console.log('Format check passed: All numbers match LB-XXXX');

  // Validate uniqueness
  const uniqueSet = new Set(results);
  if (uniqueSet.size !== CONCURRENT_REQUESTS) {
    throw new Error(`Collision detected! Expected ${CONCURRENT_REQUESTS} unique, got ${uniqueSet.size}`);
  }
  console.log(`Uniqueness check passed: ${uniqueSet.size}/${CONCURRENT_REQUESTS} completely unique numbers`);

  console.log('\n--- TEST 2: IDEMPOTENCY / RETRY PROTECTION ---');
  const sampleOrder = {
    formData: {
      nombre: 'Prueba Concurrencia',
      whatsapp: '3009998877',
      direccion: 'Carrera 10 # 20-30',
      ciudad: 'Cali'
    },
    total: 85000,
    items: [{ id: 'prod-123', quantity: 2 }],
    clientToken: 'test-token-' + Date.now()
  };

  const key = computeOrderIdempotencyKey(sampleOrder);
  console.log('Idempotency key generated:', key);

  // First submission simulation
  const check1 = checkRecentIdempotency(key);
  console.log('Initial idempotency check (should be null):', check1);
  if (check1 !== null) throw new Error('Expected null for fresh order');

  const orderNum = results[0];
  const fakeOrderId = 'fake-page-id-123';
  recordOrderIdempotency(key, orderNum, fakeOrderId);

  // Second submission simulation (e.g. double click or retry)
  const check2 = checkRecentIdempotency(key);
  console.log('Subsequent idempotency check (should return existing):', check2);
  if (!check2 || check2.orderNumber !== orderNum) {
    throw new Error('Idempotency failed to return original order number');
  }
  console.log('Idempotency check passed: Exactly the same order number returned on duplicate attempt.');

  console.log('\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

testConcurrency().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
