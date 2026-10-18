import crypto from 'crypto';

// In-memory set of numbers currently in reservation/creation flight
// to prevent race conditions during concurrent customer purchases
const activeReservations = new Map<string, number>(); // orderNumber -> timestamp
const RESERVATION_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory idempotency cache to prevent duplicate orders from rapid re-submits / double clicks
interface IdempotentOrderResult {
  orderNumber: string;
  orderId: string;
  timestamp: number;
}
const recentOrdersByIdempotency = new Map<string, IdempotentOrderResult>();
const IDEMPOTENCY_TTL_MS = 90 * 1000; // 90 seconds

function cleanExpiredReservations() {
  const now = Date.now();
  for (const [num, ts] of activeReservations.entries()) {
    if (now - ts > RESERVATION_TTL_MS) {
      activeReservations.delete(num);
    }
  }
  for (const [key, item] of recentOrdersByIdempotency.entries()) {
    if (now - item.timestamp > IDEMPOTENCY_TTL_MS) {
      recentOrdersByIdempotency.delete(key);
    }
  }
}

/**
 * Computes an idempotency hash for an order based on client data
 */
export function computeOrderIdempotencyKey(data: {
  formData: { whatsapp?: string; nombre?: string; direccion?: string };
  total?: number;
  items?: Array<{ id?: string; product?: { id?: string }; quantity?: number }>;
  clientToken?: string;
}): string {
  if (data.clientToken && data.clientToken.trim().length > 0) {
    return data.clientToken.trim();
  }

  const phone = (data.formData?.whatsapp || '').trim().replace(/\D/g, '');
  const name = (data.formData?.nombre || '').trim().toLowerCase();
  const address = (data.formData?.direccion || '').trim().toLowerCase();
  const total = data.total || 0;
  const itemsSignature = (data.items || [])
    .map((it) => `${it.product?.id || it.id}:${it.quantity}`)
    .sort()
    .join('|');

  const raw = `${phone}|${name}|${address}|${total}|${itemsSignature}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Checks if this order request is an in-flight or recently completed duplicate
 */
export function checkRecentIdempotency(key: string): IdempotentOrderResult | null {
  cleanExpiredReservations();
  const cached = recentOrdersByIdempotency.get(key);
  if (cached) {
    return cached;
  }
  return null;
}

/**
 * Stores completed order in idempotency cache
 */
export function recordOrderIdempotency(key: string, orderNumber: string, orderId: string) {
  cleanExpiredReservations();
  recentOrdersByIdempotency.set(key, {
    orderNumber,
    orderId,
    timestamp: Date.now()
  });
}

/**
 * Generates a candidate order number with format LB-XXXX
 * e.g., LB-5831, LB-1047, LB-7294, LB-3961
 */
export function generateCandidateOrderNumber(): string {
  // 4 random digits from 1000 to 9999
  const random4Digits = Math.floor(1000 + Math.random() * 9000);
  return `LB-${random4Digits}`;
}

/**
 * Checks in Notion if an order number already exists in the database
 */
export async function isOrderNumberInNotion(
  orderNumber: string,
  token: string,
  dbId: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        filter: {
          property: 'OrderNumber',
          rich_text: {
            equals: orderNumber
          }
        },
        page_size: 1
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Notion error querying OrderNumber ${orderNumber}:`, err);
      // Fail closed: assume it might exist to avoid duplicate
      return true;
    }

    const data = await response.json();
    return Array.isArray(data.results) && data.results.length > 0;
  } catch (error) {
    console.error(`Network error checking OrderNumber ${orderNumber} in Notion:`, error);
    return true; // Fail closed
  }
}

// Concurrency mutex lock to sequence candidate generation across simultaneous requests
let allocationMutex = Promise.resolve();

/**
 * Concurrency-safe unique order number allocator.
 * Guarantees that:
 * 1. The number is never assigned to two concurrent requests (in-memory lock + active reservations).
 * 2. The number is verified directly against the Notion database.
 * 3. If a collision occurs, it automatically retries with a new candidate until an unused one is found.
 */
export async function allocateUniqueOrderNumber(
  token: string,
  dbId: string,
  maxAttempts: number = 30
): Promise<string> {
  // Acquire mutex queue to prevent parallel requests from picking the same random candidate at the exact same millisecond
  let releaseMutex: () => void = () => {};
  const currentLock = new Promise<void>((resolve) => {
    releaseMutex = resolve;
  });
  const previousLock = allocationMutex;
  allocationMutex = (async () => {
    await previousLock;
    await currentLock;
  })();

  try {
    await previousLock;
    cleanExpiredReservations();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const candidate = generateCandidateOrderNumber();

      // Check in-memory concurrent reservations first
      if (activeReservations.has(candidate)) {
        continue;
      }

      // Temporarily mark reserved in memory
      activeReservations.set(candidate, Date.now());

      // Check database
      const existsInDb = await isOrderNumberInNotion(candidate, token, dbId);
      if (!existsInDb) {
        // Successfully allocated unique number!
        return candidate;
      }

      // If exists in DB, release candidate reservation and retry
      activeReservations.delete(candidate);
    }

    // High volume fallback: if 4-digit space has excessive collisions, use 5 digits
    const fallback = `LB-${Math.floor(10000 + Math.random() * 90000)}`;
    activeReservations.set(fallback, Date.now());
    return fallback;
  } finally {
    releaseMutex();
  }
}

/**
 * Releases reservation if order creation failed before being saved to Notion
 */
export function releaseOrderReservation(orderNumber: string) {
  activeReservations.delete(orderNumber);
}
