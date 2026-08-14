import fs from 'fs';
import path from 'path';
import { normalizeImageUrl } from './image';

/**
 * Intercepta URLs temporales de Notion (AWS S3) y las descarga automáticamente 
 * al almacenamiento local 'public/uploads/' para que nunca más expiren.
 */
export async function processAndCacheNotionUrl(
  rawUrl: string,
  pageId: string,
  index: number = 0
): Promise<string> {
  const normalized = normalizeImageUrl(rawUrl);

  if (!normalized || typeof normalized !== 'string') {
    return '/images/products/placeholder.webp';
  }

  // Si después de normalizar es una ruta relativa (/images/..., /uploads/...), devolverla directamente
  if (normalized.startsWith('/') || !normalized.startsWith('http')) {
    return normalized;
  }

  // Si la URL no es de Notion o AWS, devolver la URL original directamente
  if (!normalized.includes('amazonaws.com') && !normalized.includes('notion-static.com') && !normalized.includes('notion.so')) {
    return normalized;
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Extraer la ruta limpia sin parámetros de firma ?X-Amz-Expires...
    const cleanPath = rawUrl.split('?')[0];
    
    // Hash determinista de la ruta para detectar cambios de imagen
    let hash = 0;
    for (let i = 0; i < cleanPath.length; i++) {
      hash = ((hash << 5) - hash) + cleanPath.charCodeAt(i);
      hash |= 0;
    }
    const urlHash = Math.abs(hash).toString(36);

    let ext = 'jpg';
    if (cleanPath.endsWith('.png')) ext = 'png';
    else if (cleanPath.endsWith('.webp')) ext = 'webp';
    else if (cleanPath.endsWith('.jpeg')) ext = 'jpg';

    const cleanPageId = (pageId || 'img').replace(/[^a-zA-Z0-9]/g, '');
    const filename = `notion-${cleanPageId}-${index}-${urlHash}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    const publicPath = `/uploads/${filename}`;

    // Si ya fue descargada y guardada localmente, devolver la ruta local
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        return publicPath;
      }
    }

    // Si es nueva, descargarla automáticamente y escribirla en disco
    const res = await fetch(rawUrl);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      return publicPath;
    }
  } catch (err) {
    console.warn(`[AutoImageCache] No se pudo guardar localmente la imagen (${pageId}):`, err);
  }

  return rawUrl;
}
