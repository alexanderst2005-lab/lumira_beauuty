export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
  if (!url) return '';
  
  // Si la URL es de Notion o AWS (donde Notion aloja las fotos), usamos el optimizador proxy
  if (url.includes('amazonaws.com') || url.includes('notion.so') || url.includes('notion-static.com')) {
    const encodedUrl = encodeURIComponent(url);
    // wsrv.nl es un proxy gratuito
    // w: width, output: webp, we: true (auto webp), il: true (progressive)
    return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&output=webp&we&il`;
  }
  
  return url;
}
