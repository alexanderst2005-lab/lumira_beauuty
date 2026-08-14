export const DEFAULT_PLACEHOLDER = '/images/products/placeholder.webp';

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_PLACEHOLDER;
  }

  let cleanUrl = url.trim();

  // Convertir URLs de githubusercontent.com que apuntan a la carpeta public
  if (cleanUrl.includes('githubusercontent.com')) {
    if (cleanUrl.includes('/public/')) {
      const publicIndex = cleanUrl.indexOf('/public/');
      cleanUrl = cleanUrl.substring(publicIndex + 7);
    } else if (cleanUrl.includes('/images/')) {
      const imagesIndex = cleanUrl.indexOf('/images/');
      cleanUrl = cleanUrl.substring(imagesIndex);
    }
  }

  // Convertir URLs absolutas del propio dominio Vercel a rutas relativas estáticas locales /images/...
  if (cleanUrl.includes('/images/products/')) {
    const imgIndex = cleanUrl.indexOf('/images/products/');
    cleanUrl = cleanUrl.substring(imgIndex);
  }

  return cleanUrl;
}

export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
  const cleanUrl = normalizeImageUrl(url);

  if (cleanUrl === DEFAULT_PLACEHOLDER) {
    return DEFAULT_PLACEHOLDER;
  }

  // Si la URL es una ruta relativa local (/images/..., /uploads/...), devolverla directamente
  if (cleanUrl.startsWith('/') || !cleanUrl.startsWith('http')) {
    return cleanUrl;
  }
  
  // Si la URL es de Notion o AWS (donde Notion aloja las fotos)
  if (cleanUrl.includes('amazonaws.com') || cleanUrl.includes('notion.so') || cleanUrl.includes('notion-static.com')) {
    try {
      const encodedUrl = encodeURIComponent(cleanUrl);
      return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&output=webp&we&il`;
    } catch {
      return cleanUrl;
    }
  }
  
  return cleanUrl;
}


