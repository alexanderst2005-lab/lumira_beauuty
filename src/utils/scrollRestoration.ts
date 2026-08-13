/**
 * Utilidad para guardar y restaurar la posición exacta de desplazamiento (scroll)
 * y el estado de navegación (filtros, categorías, búsqueda) en la tienda.
 */

const SCROLL_PREFIX = 'lumira_scroll_pos_';
const LAST_URL_KEY = 'lumira_last_catalog_url';

/**
 * Guarda la posición actual de scroll y la URL completa de la lista/catálogo.
 */
export function saveCurrentScrollPosition(): void {
  if (typeof window === 'undefined') return;

  try {
    const currentPathAndSearch = window.location.pathname + window.location.search;
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;

    // Guardar posición para la URL actual
    sessionStorage.setItem(`${SCROLL_PREFIX}${currentPathAndSearch}`, currentY.toString());

    // Guardar última URL de catálogo/origen visitada
    sessionStorage.setItem(LAST_URL_KEY, currentPathAndSearch);
  } catch (e) {
    console.error('Error guardando posición de scroll:', e);
  }
}

/**
 * Obtiene la última URL de catálogo o vista previa guardada.
 */
export function getLastCatalogUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(LAST_URL_KEY);
  } catch {
    return null;
  }
}

/**
 * Obtiene la posición de scroll guardada para una URL específica.
 */
export function getSavedScrollPosition(url?: string): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const targetUrl = url || (window.location.pathname + window.location.search);
    const saved = sessionStorage.getItem(`${SCROLL_PREFIX}${targetUrl}`);
    if (saved !== null) {
      const val = parseInt(saved, 10);
      return !isNaN(val) ? val : null;
    }
  } catch (e) {
    console.error('Error leyendo posición de scroll:', e);
  }

  return null;
}

/**
 * Limpia la posición de scroll guardada para una URL específica.
 */
export function clearSavedScrollPosition(url?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const targetUrl = url || (window.location.pathname + window.location.search);
    sessionStorage.removeItem(`${SCROLL_PREFIX}${targetUrl}`);
  } catch (e) {
    console.error('Error limpiando posición de scroll:', e);
  }
}
