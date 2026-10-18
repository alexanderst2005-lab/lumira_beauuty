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

if (!TOKEN || !DB_ID) {
  console.error('Missing NOTION_SECRET or NOTION_ORDERS_DB');
  process.exit(1);
}

async function queryAllOrders() {
  let hasMore = true;
  let startCursor = undefined;
  const allResults = [];

  while (hasMore) {
    const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to query database: ${err}`);
    }

    const data = await res.json();
    allResults.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return allResults;
}

function generateRandom4Digits() {
  return Math.floor(1000 + Math.random() * 9000);
}

async function updateOrderNumber(pageId, newOrderNumber) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      properties: {
        OrderNumber: {
          rich_text: [{ text: { content: newOrderNumber } }]
        }
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update page ${pageId}: ${err}`);
  }
}

async function run() {
  console.log('Fetching all orders from Notion...');
  const pages = await queryAllOrders();
  console.log(`Found ${pages.length} orders in Notion.`);

  const usedNumbers = new Set();
  const toUpdate = [];

  // Pass 1: Identify existing LB-XXXX that are already valid and non-duplicate
  pages.forEach(p => {
    const currentNumber = p.properties.OrderNumber?.rich_text?.[0]?.plain_text?.trim() || '';
    if (/^LB-\d{4}$/.test(currentNumber)) {
      if (!usedNumbers.has(currentNumber)) {
        usedNumbers.add(currentNumber);
      } else {
        toUpdate.push({ page: p, reason: `Duplicate valid number: ${currentNumber}` });
      }
    } else {
      toUpdate.push({ page: p, reason: `Legacy or invalid format: "${currentNumber}"` });
    }
  });

  console.log(`Already valid unique LB-XXXX: ${usedNumbers.size}`);
  console.log(`Orders to migrate/update: ${toUpdate.length}`);

  for (let i = 0; i < toUpdate.length; i++) {
    const { page, reason } = toUpdate[i];
    let candidate = '';
    do {
      candidate = `LB-${generateRandom4Digits()}`;
    } while (usedNumbers.has(candidate));

    usedNumbers.add(candidate);
    const customerName = page.properties.Name?.title?.[0]?.plain_text || 'Sin Nombre';
    const oldNum = page.properties.OrderNumber?.rich_text?.[0]?.plain_text || 'VACIO';

    console.log(`[${i + 1}/${toUpdate.length}] Updating ${customerName} (${oldNum} -> ${candidate}). Reason: ${reason}`);
    await updateOrderNumber(page.id, candidate);
    // Be polite with Notion rate limits
    await new Promise(r => setTimeout(r, 250));
  }

  console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');

  // Verify uniqueness
  console.log('Verifying final uniqueness in Notion...');
  const refreshed = await queryAllOrders();
  const finalMap = new Map();
  let duplicatesCount = 0;

  refreshed.forEach(p => {
    const num = p.properties.OrderNumber?.rich_text?.[0]?.plain_text?.trim() || 'SIN_NUMERO';
    if (finalMap.has(num)) {
      duplicatesCount++;
      console.error(`COLLISION DETECTED: ${num} exists on ${p.id} and ${finalMap.get(num)}`);
    } else {
      finalMap.set(num, p.id);
    }
  });

  if (duplicatesCount === 0) {
    console.log(`PERFECT: All ${refreshed.length} orders now have 100% unique LB-XXXX numbers!`);
    console.log('Sample updated numbers:');
    refreshed.slice(0, 10).forEach(p => {
      console.log(` - ${p.properties.OrderNumber?.rich_text?.[0]?.plain_text}: ${p.properties.Name?.title?.[0]?.plain_text}`);
    });
  } else {
    console.error(`Warning: ${duplicatesCount} duplicates still detected!`);
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
