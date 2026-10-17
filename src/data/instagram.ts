/**
 * Datos de Instagram de Lumira Beauty.
 *
 * Para mostrar publicaciones reales en la portada, agrega aquí cada una con:
 *  - image: ruta de la imagen (por ejemplo '/images/instagram/post-1.jpg') o URL completa
 *  - url:   enlace directo a la publicación en Instagram
 *  - alt:   texto alternativo que describa la imagen
 *
 * Mientras la lista esté vacía, la sección solo muestra el título y el botón
 * para visitar el perfil: no se muestran imágenes de muestra ni datos ficticios.
 */

export interface InstagramPost {
  image: string;
  url: string;
  alt: string;
}

export const INSTAGRAM_PROFILE_URL =
  'https://www.instagram.com/lumira_beauuty?igsh=eHkzbWJkM3Mxbm10';

// Se muestran como máximo 6 publicaciones.
export const instagramPosts: InstagramPost[] = [];
