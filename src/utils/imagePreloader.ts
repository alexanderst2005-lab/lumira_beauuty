import { getOptimizedImageUrl } from './image';
import { Product } from '@/types';

// Set de URLs que ya se han precargado o están en cola
const preloadedUrls = new Set<string>();

// Cola de tareas de precarga
type PreloadTask = {
  url: string;
};

const queue: PreloadTask[] = [];
let activeConnections = 0;
const MAX_CONCURRENT_PRELOADS = 4;

function processQueue() {
  if (activeConnections >= MAX_CONCURRENT_PRELOADS || queue.length === 0) {
    return;
  }

  const task = queue.shift();
  if (!task) return;

  activeConnections++;

  const img = new Image();
  img.onload = () => {
    activeConnections--;
    processQueue();
  };
  img.onerror = () => {
    activeConnections--;
    processQueue();
  };
  img.src = task.url;
}

/**
 * Precarga una imagen individual en segundo plano de manera no bloqueante.
 */
export function preloadSingleImage(rawUrl: string | null | undefined, width: number = 400): void {
  if (!rawUrl) return;
  const optimizedUrl = getOptimizedImageUrl(rawUrl, width);
  if (!optimizedUrl || preloadedUrls.has(optimizedUrl)) return;

  preloadedUrls.add(optimizedUrl);
  queue.push({ url: optimizedUrl });
  processQueue();
}

/**
 * Precarga las imágenes de un arreglo de productos para un rango específico.
 */
export function preloadProductImages(
  products: Product[],
  startIndex: number = 0,
  count: number = 12,
  width: number = 400
): void {
  if (!products || products.length === 0) return;

  const endIndex = Math.min(startIndex + count, products.length);
  for (let i = startIndex; i < endIndex; i++) {
    const product = products[i];
    if (product && product.image) {
      preloadSingleImage(product.image, width);
    }
  }
}
