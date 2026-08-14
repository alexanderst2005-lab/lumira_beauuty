export const DEFAULT_PLACEHOLDER = '/images/products/placeholder.webp';

export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PLACEHOLDER;
  }
  
  const cleanUrl = url.trim();

  // Si la URL es una ruta relativa local (/images/..., /uploads/...), devolverla directamente
  if (cleanUrl.startsWith('/') || !cleanUrl.startsWith('http')) {
    return cleanUrl;
  }
  
  // Si la URL es de Notion o AWS (donde Notion aloja las fotos)
  if (cleanUrl.includes('amazonaws.com') || cleanUrl.includes('notion.so') || cleanUrl.includes('notion-static.com')) {
    // Si la URL ya está expirada o es una URL firmada de AWS, intentamos usarla directamente
    // o mediante el proxy si no ha expirado aún
    try {
      const encodedUrl = encodeURIComponent(cleanUrl);
      return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&output=webp&we&il`;
    } catch {
      return cleanUrl;
    }
  }
  
  return cleanUrl;
}

