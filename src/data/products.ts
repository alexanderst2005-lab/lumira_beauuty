import { Product, CategoryInfo } from '@/types';

export const categories: CategoryInfo[] = [
  { id: 'pestanas-punto-a-punto', name: 'Pestañas Punto a Punto', emoji: '👁️', slug: 'pestanas-punto-a-punto' },
  { id: 'pestanas-enteras', name: 'Pestañas Enteras', emoji: '👁️', slug: 'pestanas-enteras' },
  { id: 'makeup', name: 'Makeup', emoji: '💄', slug: 'makeup' },
  { id: 'skincare', name: 'Skincare', emoji: '🧴', slug: 'skincare' },
  { id: 'corporal', name: 'Corporal', emoji: '🧴', slug: 'corporal' },
  { id: 'productos-cabello', name: 'Productos para el Cabello', emoji: '💇', slug: 'productos-cabello' },
  { id: 'accesorios', name: 'Accesorios', emoji: '🎀', slug: 'accesorios' },
  { id: 'todos', name: 'Todos los Productos', emoji: '⭐', slug: 'todos' },
];

export const products: Product[] = [
  // ==========================================
  // PESTAÑAS PUNTO A PUNTO
  // ==========================================
  { id: 'ppp-001', name: 'Pestañas punto a punto varios volúmenes', description: 'Ideales para crear un efecto natural o de mayor volumen.', fullDescription: 'Ideales para crear un efecto natural o de mayor volumen según tu estilo.', price: 22000, category: 'pestanas-punto-a-punto', image: '/images/products/pestanas-punto-a-punto-varios.jpg' },
  { id: 'ppp-002', name: 'Pestañas 60D+80D+100D', description: 'Kit con diferentes volúmenes para un acabado personalizado.', fullDescription: 'Kit con diferentes volúmenes para lograr un acabado personalizado y profesional.', price: 22000, category: 'pestanas-punto-a-punto', image: '/images/products/pestanas-60-80-100.jpg' },
  { id: 'ppp-003', name: 'Pestañas ojo de gato 40D', description: 'Diseño efecto ojo de gato que alarga visualmente la mirada.', fullDescription: 'Diseño efecto ojo de gato que alarga visualmente la mirada con un acabado elegante.', price: 8000, category: 'pestanas-punto-a-punto', image: '/images/products/pestanas-40d.jpg' },

  // ==========================================
  // PESTAÑAS ENTERAS
  // ==========================================
  { id: 'pe-001', name: 'Pestañas enteras volumen', description: 'Pestañas completas con volumen intenso.', fullDescription: 'Pestañas completas con volumen intenso para una mirada impactante.', price: 25000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-002', name: 'Pestañas enteras ojo de gato', description: 'Diseño estilizado que crea un efecto de ojos más alargados.', fullDescription: 'Diseño estilizado que crea un efecto de ojos más alargados.', price: 25000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-003', name: 'Pestañas enteras con color', description: 'Pestañas decorativas con color para un look diferente.', fullDescription: 'Pestañas decorativas con color para un look diferente y llamativo.', price: 25000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-004', name: 'Pestañas volumen ruso + espigas 60/80D', description: 'Combinación de volumen ruso y espigas.', fullDescription: 'Combinación de volumen ruso y espigas para un acabado profesional.', price: 25000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-005', name: 'Pestañas 60D', description: 'Volumen medio perfecto para el uso diario.', fullDescription: 'Volumen medio perfecto para el uso diario.', price: 18000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-006', name: 'Pestañas naturales 40D', description: 'Apariencia natural que resalta la mirada.', fullDescription: 'Apariencia natural que resalta la mirada sin exagerar.', price: 17000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-007', name: 'Ojo de gato 100D', description: 'Mayor volumen con efecto alargado.', fullDescription: 'Mayor volumen con efecto alargado para una mirada elegante.', price: 20000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-008', name: 'Pestañas 40D', description: 'Pestañas ligeras para un acabado sutil y natural.', fullDescription: 'Pestañas ligeras para un acabado sutil y natural.', price: 8000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-009', name: 'Pestañas 160D efecto pelo a pelo', description: 'Efecto de mayor densidad con apariencia natural.', fullDescription: 'Efecto de mayor densidad con apariencia similar a pestañas naturales.', price: 18000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-010', name: 'Pestañas volumen 60D', description: 'Volumen equilibrado para un maquillaje versátil.', fullDescription: 'Volumen equilibrado para un maquillaje versátil.', price: 18000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-011', name: 'Libro Natural 40+50D', description: 'Libro con diferentes estilos de pestañas naturales.', fullDescription: 'Libro con diferentes estilos de pestañas naturales para múltiples ocasiones.', price: 35000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-012', name: 'Pestañas 100D', description: 'Pestañas de alto volumen para un maquillaje intenso.', fullDescription: 'Pestañas de alto volumen para un maquillaje más intenso.', price: 22000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-013', name: 'Pestañita Pumped Volumen', description: 'Pestañas compactas con efecto de volumen.', fullDescription: 'Pestañas compactas con efecto de volumen para una mirada definida.', price: 9000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-014', name: 'Libro Mega Volumen 50/60/80/100D', description: 'Kit completo de diferentes volúmenes intensos.', fullDescription: 'Kit completo de diferentes volúmenes intensos para crear cualquier look.', price: 38000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },
  { id: 'pe-015', name: 'Libro 6 Volúmenes', description: 'Colección de 6 estilos diferentes de volumen.', fullDescription: 'Colección de 6 estilos diferentes de volumen para pestañas espectaculares.', price: 35000, category: 'pestanas-enteras', image: '/images/products/placeholder.webp' },

  // ==========================================
  // MAKEUP
  // ==========================================
  { id: 'mk-001', name: 'Corrector Anik (varios tonos)', description: 'Corrector de alta cobertura con acabado natural.', fullDescription: 'Corrector de alta cobertura con acabado natural para unificar el tono de la piel.', price: 20000, category: 'makeup', image: '/images/products/corrector-anik-1.png', images: ['/images/products/corrector-anik-1.png', '/images/products/corrector-anik-2.jpg'], tones: [
    { name: '00. Snow', hex: '#FFF2E6' },
    { name: '01. Bone', hex: '#F7E1D7' },
    { name: '02. Radiant', hex: '#EED3AE' },
    { name: '03. Honey', hex: '#D6A675' },
    { name: '04. Ginger', hex: '#C68E58' },
    { name: '05. Golden Brown', hex: '#995C30' }
  ] },
  { id: 'mk-002', name: 'Correctores Bloomshell', description: 'Corrector líquido de excelente cobertura.', fullDescription: 'Corrector líquido de excelente cobertura para un maquillaje impecable.', price: 20000, category: 'makeup', image: '/images/products/corrector-bloomshell-1.jpg', images: ['/images/products/corrector-bloomshell-1.jpg', '/images/products/corrector-bloomshell-2.jpg'], tones: [
    { name: '00', hex: '#F5EBE6' }, { name: '01', hex: '#EDDEC7' }, { name: '02', hex: '#E2CAAF' },
    { name: '03', hex: '#D5B595' }, { name: '04', hex: '#C9A27F' }, { name: '4.5', hex: '#B58E6B' },
    { name: '05', hex: '#AA7F56' }, { name: '5.5', hex: '#946A41' }, { name: '08', hex: '#6C4A2C' },
    { name: '06', hex: '#DD7D59' }, { name: '07', hex: '#F3B2B1' }
  ] },
  { id: 'mk-003', name: 'Mini Correctores Bloomshell', description: 'Versión compacta, ideal para llevar en el bolso.', fullDescription: 'Versión compacta, ideal para llevar en el bolso o de viaje.', price: 13000, category: 'makeup', image: '/images/products/mini-corrector-bloomshell-1.png', images: ['/images/products/mini-corrector-bloomshell-1.png', '/images/products/mini-corrector-bloomshell-2.jpg'], tones: [
    { name: '00', hex: '#F5EBE6' }, { name: '01', hex: '#EDDEC7' }, { name: '02', hex: '#E2CAAF' },
    { name: '03', hex: '#D5B595' }, { name: '04', hex: '#C9A27F' }, { name: '4.5', hex: '#B58E6B' },
    { name: '05', hex: '#AA7F56' }, { name: '5.5', hex: '#946A41' }, { name: '08', hex: '#6C4A2C' },
    { name: '06', hex: '#DD7D59' }, { name: '07', hex: '#F3B2B1' }
  ] },
  { id: 'mk-004', name: 'Tinta Osito', description: 'Tinta multifuncional para labios y mejillas.', fullDescription: 'Tinta multifuncional para labios y mejillas con acabado natural.', price: 7000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-005', name: 'Tinta Rimocoo', description: 'Tinta de larga duración con color intenso.', fullDescription: 'Tinta de larga duración con color intenso y ligero.', price: 6000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-006', name: 'Brillo Gloss con Color Plum', description: 'Gloss hidratante con un toque de color brillante.', fullDescription: 'Gloss hidratante con un toque de color brillante.', price: 6000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-007', name: 'Brillo Gloss Glitter Victoria Spirit', description: 'Gloss con partículas brillantes para un acabado luminoso.', fullDescription: 'Gloss con partículas brillantes para un acabado luminoso.', price: 8000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-008', name: 'Pestañita Princesas Blancanieves Trendy', description: 'Pestañas inspiradas en un estilo delicado.', fullDescription: 'Pestañas inspiradas en un estilo delicado y elegante.', price: 20000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-009', name: 'Lip Gloss de Engol con Llaverito', description: 'Gloss hidratante con práctico llavero.', fullDescription: 'Gloss hidratante con práctico llavero para llevar a todas partes.', price: 7000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-010', name: 'Brillo Aura Mocca (Tonos 2 y 3)', description: 'Brillo labial con acabado suave y natural.', fullDescription: 'Brillo labial con acabado suave y tonos naturales.', price: 18000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-011', name: 'Gel de Cejas Melu', description: 'Fija y define las cejas durante todo el día.', fullDescription: 'Fija y define las cejas durante todo el día.', price: 17000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-012', name: 'Rubor Corazón Paulis', description: 'Rubor con acabado natural que aporta frescura.', fullDescription: 'Rubor con acabado natural que aporta frescura al rostro.', price: 11000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-013', name: 'Rubor en Crema Paulis', description: 'Rubor cremoso de fácil aplicación.', fullDescription: 'Rubor cremoso de fácil aplicación y larga duración.', price: 11200, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-014', name: 'Polvos Sueltos y Compactos Jack Trendy', description: 'Polvos para sellar el maquillaje con acabado uniforme.', fullDescription: 'Polvos para sellar el maquillaje con acabado uniforme.', price: 30000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-015', name: 'Brillo Gloss Victoria Spirit', description: 'Gloss hidratante que aporta brillo y suavidad.', fullDescription: 'Gloss hidratante que aporta brillo y suavidad a los labios.', price: 8000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-016', name: 'Fijador Dreams Trendy', description: 'Fijador de maquillaje de larga duración.', fullDescription: 'Fijador de maquillaje que prolonga la duración y frescura de tu look.', price: 15000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-017', name: 'Primer Pop', description: 'Prepara tu piel para un maquillaje impecable.', fullDescription: 'Primer que prepara la piel, minimiza poros y alarga la duración del maquillaje.', price: 15000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-018', name: 'Polvo Suelto Fix & Go 20G', description: 'Polvo suelto para sellar y matificar.', fullDescription: 'Polvo suelto ultra fino ideal para sellar el maquillaje y eliminar el brillo.', price: 12000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-019', name: 'Bloom Sublime XL Bloomshell', description: 'Producto esencial para un acabado sublime.', fullDescription: 'Producto esencial de alta cobertura para un acabado impecable y sublime.', price: 22900, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-020', name: 'Tónico de Rosas Paulis', description: 'Refresca e hidrata la piel antes del maquillaje.', fullDescription: 'Tónico facial de agua de rosas que hidrata, refresca y prepara la piel.', price: 9000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-021', name: 'Polvos Sueltos Bakery Grande Trendy', description: 'Polvos sueltos tamaño grande para sellar.', fullDescription: 'Polvos sueltos tamaño grande ideales para la técnica de baking y sellado prolongado.', price: 20000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-022', name: 'Kit Rubor y Gloss Pinky News Trendy', description: 'Dúo perfecto de rubor y gloss labial.', fullDescription: 'Kit completo que incluye un rubor pigmentado y un gloss a juego.', price: 15000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-023', name: 'Polvo Traslúcido Mini', description: 'Polvo traslúcido en presentación de bolsillo.', fullDescription: 'Polvo traslúcido para sellar tu maquillaje sobre la marcha. Tamaño mini.', price: 26000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-024', name: 'Nude + Mini Gloss Hidratante Bloom', description: 'Set de tono nude más gloss hidratante.', fullDescription: 'Combinación ideal para labios nude naturales con hidratación intensa.', price: 24000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-025', name: 'Polvo Raquel Banana', description: 'Polvo suelto tono banana para iluminar.', fullDescription: 'Polvo suelto tono amarillo ideal para sellar e iluminar zonas del rostro.', price: 20000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-026', name: 'Iluminador en Polvo Corazón', description: 'Iluminador compacto para un brillo espectacular.', fullDescription: 'Iluminador compacto en forma de corazón que resalta y da luz al rostro.', price: 10000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-027', name: 'Pop Bloom Mimosa', description: 'Toque de color radiante y duradero.', fullDescription: 'Tono vibrante de larga duración para darle vida a tu look.', price: 22000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-028', name: 'Rubor en Barra Barbie Vaquera Trendy', description: 'Rubor cremoso en práctica presentación de barra.', fullDescription: 'Rubor en barra fácil de difuminar con acabado jugoso y natural.', price: 15000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-029', name: 'Contorno en Barra de Chocolate Trendy', description: 'Contorno cremoso para perfilar el rostro.', fullDescription: 'Contorno en barra con tono cálido, fácil de difuminar para definir facciones.', price: 15000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-030', name: 'Bloom Latte Kiss', description: 'Labial con acabado mate suave.', fullDescription: 'Labial en tono latte con un acabado aterciopelado que no reseca los labios.', price: 16000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-031', name: 'Bloom Matificante', description: 'Producto matificante para controlar el brillo.', fullDescription: 'Solución eficaz para reducir el exceso de grasa y matificar la piel por horas.', price: 20000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-032', name: 'Kit Labios Gloss Princesas Trendy', description: 'Colección de gloss inspirados en princesas.', fullDescription: 'Set exclusivo de gloss ultra brillantes para unos labios hidratados y voluminosos.', price: 25000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-033', name: 'Rubor Vergüenza Trendy', description: 'Rubor súper pigmentado para mejillas sonrojadas.', fullDescription: 'Rubor en polvo altamente pigmentado para un look natural de mejillas ruborizadas.', price: 18000, category: 'makeup', image: '/images/products/placeholder.webp' },
  { id: 'mk-034', name: 'Bloom Mocha + Espejo', description: 'Compacto multifuncional con espejo incluido.', fullDescription: 'Tono mocha perfecto con espejo integrado, ideal para retoques rápidos.', price: 25000, category: 'makeup', image: '/images/products/placeholder.webp' },

  // ==========================================
  // SKINCARE
  // ==========================================
  { id: 'sk-001', name: 'Jabón de Azufre Purpure', description: 'Limpia profundamente y controla el exceso de grasa.', fullDescription: 'Limpia profundamente la piel y ayuda a controlar el exceso de grasa.', price: 12000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-002', name: 'Colágeno de Ojeras Bioaqua', description: 'Hidrata y revitaliza el contorno de ojos.', fullDescription: 'Ayuda a hidratar y revitalizar el contorno de los ojos, reduciendo ojeras.', price: 1200, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-003', name: 'Mascarillas en Velo', description: 'Mascarillas hidratantes para una piel fresca.', fullDescription: 'Mascarillas hidratantes para una piel fresca y luminosa.', price: 2200, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-004', name: 'Sérum de Vitamina C 30ML', description: 'Ilumina la piel y unifica el tono.', fullDescription: 'Ilumina la piel y ayuda a unificar el tono del rostro.', price: 8000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-005', name: 'Protector Solar SPF50+ Bioaqua', description: 'Protección solar de amplio espectro.', fullDescription: 'Protección solar de amplio espectro para el uso diario sin residuo blanco.', price: 12000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-006', name: 'Mascarilla para Puntos Negros', description: 'Remueve impurezas y limpia poros.', fullDescription: 'Ayuda a remover impurezas profundas y a limpiar los poros del rostro.', price: 3000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-007', name: 'Toallas Desmaquillantes', description: 'Eliminan maquillaje e impurezas rápidamente.', fullDescription: 'Eliminan maquillaje e impurezas de forma práctica y suave con la piel.', price: 7000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-008', name: 'Chapstick Hidratante Bioaqua', description: 'Mantiene los labios suaves e hidratados.', fullDescription: 'Mantiene los labios suaves, hidratados y protegidos durante todo el día.', price: 4000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-009', name: 'Tratamiento de Pestañas Bioaqua', description: 'Nutre y fortalece tus pestañas.', fullDescription: 'Nutre profundamente y estimula el fortalecimiento y crecimiento de las pestañas.', price: 10000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-010', name: 'Bloom Aqua Tint', description: 'Tinta ligera hidratante de acabado natural.', fullDescription: 'Tinta de acabado ligero y base acuosa para un look natural.', price: 15000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-011', name: 'Parches de Granitos', description: 'Protegen y secan imperfecciones.', fullDescription: 'Ayudan a proteger y tratar imperfecciones focalizadas durante la noche.', price: 5000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-012', name: 'Bloom Lamination', description: 'Define y fija las cejas.', fullDescription: 'Producto especial para definir, laminar y fijar cejas o pestañas.', price: 18000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-013', name: 'Crema Facial de Ácido Hialurónico', description: 'Hidratación intensa para el rostro.', fullDescription: 'Hidratación intensa de absorción rápida para una piel más suave.', price: 8000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-014', name: 'Sérum de Nicotinamida', description: 'Mejora textura y luminosidad.', fullDescription: 'Ayuda a mejorar la textura, reducir poros y dar luminosidad a la piel.', price: 8000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-015', name: 'Crema de Manos de Durazno Bioaqua', description: 'Suaviza manos con aroma a durazno.', fullDescription: 'Hidrata y suaviza las manos secas con un delicioso aroma a durazno.', price: 6000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-016', name: 'Sérum Bioaqua', description: 'Sérum hidratante esencial.', fullDescription: 'Sérum hidratante y regenerador básico para tu cuidado facial diario.', price: 8000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-017', name: 'Jabón Facial de Ácido Hialurónico', description: 'Limpieza con extra hidratación.', fullDescription: 'Limpieza facial suave con efecto altamente hidratante sin dejar tirantez.', price: 12000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-018', name: 'Contorno de Ojeras de Vitamina C', description: 'Ilumina la mirada.', fullDescription: 'Ayuda a iluminar el área del contorno de ojos, reduciendo el tono oscuro.', price: 6000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-019', name: 'Splash Mini Piña Colada', description: 'Bruma hidratante refrescante.', fullDescription: 'Fragancia refrescante con extractos que revitalizan la piel. Aroma tropical.', price: 15000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-020', name: 'Polvo Traslúcido 2 en 1', description: 'Sella y matifica al instante.', fullDescription: 'Sella el maquillaje y absorbe grasa con un acabado natural imperceptible.', price: 29000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-021', name: 'Jabón Espuma Limpiadora', description: 'Espuma facial ultra suave.', fullDescription: 'Espuma facial para una limpieza suave, retirando la suciedad del día a día.', price: 11000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-022', name: 'Crema Facial de Arroz Bioaqua', description: 'Nutre la piel con extracto de arroz.', fullDescription: 'Nutre, hidrata e ilumina la piel gracias al poder del extracto de arroz.', price: 8000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-023', name: 'Primer Jelly Fusión Bloom', description: 'Primer hidratante textura gel.', fullDescription: 'Prepara la piel con una hidratación jugosa para un maquillaje más duradero.', price: 28000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-024', name: 'Jabón Facial de Nicotinamida', description: 'Limpieza iluminadora.', fullDescription: 'Limpieza facial para una piel fresca, radiante y con tono más uniforme.', price: 10000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-025', name: 'Primer Poros Invisibles', description: 'Minimiza poros antes del maquillaje.', fullDescription: 'Pre-base que minimiza visualmente los poros, creando un lienzo suave.', price: 17000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-026', name: 'Contorno de Ojos de Arroz Bioaqua', description: 'Revitaliza y suaviza líneas finas.', fullDescription: 'Hidrata y revitaliza la delicada zona del contorno de ojos.', price: 6000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-027', name: 'Sérum Facial de Ácido Hialurónico', description: 'Textura ligera, máxima hidratación.', fullDescription: 'Hidratación profunda que rellena y aporta vitalidad a la piel.', price: 9000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-028', name: 'Gelatina Gelei Bloomshell', description: 'Gel de hidratación rápida.', fullDescription: 'Gel hidratante de rápida absorción para revitalizar la piel cansada.', price: 14000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-029', name: 'Mascarillas en Velo Bioaqua', description: 'Spa facial en casa.', fullDescription: 'Diferentes mascarillas faciales de velo para brindar una hidratación intensa.', price: 2200, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-030', name: 'Bloom Mist Fix Hidratante', description: 'Fija el maquillaje aportando agua.', fullDescription: 'Fijador tipo bruma que hidrata la piel y prolonga la duración de tu look.', price: 24000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-031', name: 'Papel de Arroz 100 und', description: 'Retoca tu maquillaje absorbiendo brillo.', fullDescription: 'Hojas absorbentes de arroz ideales para controlar el brillo facial durante el día.', price: 4500, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-032', name: 'Kit Grande de Vitamina C Bioaqua', description: 'Tratamiento iluminador completo.', fullDescription: 'Kit de varios pasos enriquecido con vitamina C para iluminar tu rostro.', price: 42000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-033', name: 'Mini Kit Viajero de Vitamina C Bioaqua', description: 'Skincare luminoso para llevar.', fullDescription: 'Toda la rutina de Vitamina C en cómodos tamaños de viaje.', price: 23000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-034', name: 'Kit Grande de Arroz Bioaqua', description: 'Rutina aclaradora y suavizante.', fullDescription: 'Tratamiento completo a base de extracto de arroz para un tono uniforme.', price: 42000, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-035', name: 'Colágeno de Labios Bioaqua', description: 'Mascarilla regeneradora labial.', fullDescription: 'Mascarilla para nutrir, hidratar y reparar los labios resecos o agrietados.', price: 1200, category: 'skincare', image: '/images/products/placeholder.webp' },
  { id: 'sk-036', name: 'Crema Facial Vitamina C', description: 'Crema iluminadora anti-oxidante.', fullDescription: 'Crema facial diaria enriquecida con Vitamina C para hidratar y revitalizar la piel.', price: 10000, category: 'skincare', image: '/images/products/placeholder.webp' },

  // ==========================================
  // CORPORAL
  // ==========================================
  { id: 'cp-001', name: 'Aceite Truly 50ml', description: 'Aceite corporal suave y luminoso.', fullDescription: 'Aceite corporal hidratante de lujo para dejar una piel tersa y luminosa.', price: 16000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-002', name: 'Rayitos de Sol', description: 'Aporta un hermoso efecto bronceado.', fullDescription: 'Producto luminoso para aportar un efecto bronceado y brillante a la piel.', price: 15000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-003', name: 'Brilli Brilli Purpure', description: 'Iluminador corporal brillante.', fullDescription: 'Iluminador corporal con acabado brillante espectacular para resaltar tus curvas.', price: 17000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-004', name: 'Gel de Ducha Purpure', description: 'Limpieza corporal perfumada.', fullDescription: 'Gel de baño que limpia suavemente dejando una agradable fragancia en la piel.', price: 25000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-005', name: 'Splash Purpure 200ml', description: 'Splash con aroma duradero.', fullDescription: 'Splash corporal refrescante con aroma seductor y duradero.', price: 25000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-006', name: 'Beauty Blender', description: 'Esponja de maquillaje uniforme.', fullDescription: 'Esponja ideal para aplicar maquillaje de manera suave y uniforme (categoría corporal).', price: 3000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-007', name: 'Kit Truly', description: 'Kit completo corporal Truly.', fullDescription: 'Kit de cuidado corporal completo para hidratar y perfumar.', price: 45000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-008', name: 'Kit Truly x5 Arruru', description: 'Set corporal x5 aromas exquisitos.', fullDescription: 'Kit de cinco productos corporales con aromas deliciosos.', price: 50000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-009', name: 'Mantequillas Corporales Purpure', description: 'Nutrición extrema para el cuerpo.', fullDescription: 'Mantequilla densa que aporta máxima hidratación a la piel seca.', price: 24000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-010', name: 'Mini Mantequilla Corporal 50gr Importada', description: 'Hidratación intensa tamaño bolsillo.', fullDescription: 'Mantequilla corporal hidratante en práctica presentación de 50gr.', price: 13000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-011', name: 'Mini Mantequilla 50gr Purpure', description: 'Nutrición Purpure tamaño viaje.', fullDescription: 'Mantequilla altamente nutritiva para llevar contigo a todos lados.', price: 12000, category: 'corporal', image: '/images/products/placeholder.webp' },
  { id: 'cp-012', name: 'Mini Splash 100ml Importado Purpure', description: 'Aroma encantador para retocar.', fullDescription: 'Lleva tu fragancia favorita a cualquier parte con este splash de 100ml.', price: 16000, category: 'corporal', image: '/images/products/placeholder.webp' },

  // ==========================================
  // ACCESORIOS
  // ==========================================
  { id: 'ac-001', name: 'Perfiladores', description: 'Define cejas o vello facial.', fullDescription: 'Herramienta precisa y segura para definir cejas o remover el vello facial.', price: 3000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-002', name: 'Salón Pro', description: 'Accesorio profesional de belleza.', fullDescription: 'Accesorio de belleza indispensable para facilitar la aplicación del maquillaje.', price: 8000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-003', name: 'Cepillo más Brocha para Cejas', description: 'Doble punta para definir y peinar.', fullDescription: 'Brocha doble ideal para aplicar producto en las cejas y luego peinarlas.', price: 3000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-004', name: 'Gancho Hawaiano Grande', description: 'Sujeta tu cabello con firmeza.', fullDescription: 'Accesorio grande y resistente para sujetar el cabello con estilo hawaiano.', price: 5000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-005', name: 'Lápices de Samy', description: 'Lápiz básico para uso diario.', fullDescription: 'Lápiz delineador suave para ojos o labios, ideal para todos los días.', price: 4000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-006', name: 'Betún de Cejas Samy', description: 'Define y rellena con precisión.', fullDescription: 'Pomada o betún cremoso para perfilar y rellenar las cejas, de larga duración.', price: 12000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-007', name: 'Pinza Metálica', description: 'Depilación precisa de cejas.', fullDescription: 'Pinza de alta precisión diseñada para depilar y dar forma a tus cejas.', price: 4000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-008', name: 'Gancho Hawaiano Mediano', description: 'Práctico gancho de cabello.', fullDescription: 'Gancho mediano y resistente, ideal para recoger tu cabello cómodamente.', price: 4000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-009', name: 'Cosmetiqueras de Peluche', description: 'Guarda tus productos con estilo.', fullDescription: 'Cosmetiquera amplia y muy suave de peluche para organizar tus maquillajes.', price: 18000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-010', name: 'Encrispadores', description: 'Rizador para pestañas curvas.', fullDescription: 'Rizador de pestañas ergonómico para una mirada mucho más abierta y definida.', price: 10000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-011', name: 'Pañitos', description: 'Prácticos para limpiar el rostro.', fullDescription: 'Pañitos húmedos ideales para limpieza rápida o desmaquillar el rostro.', price: 3500, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-012', name: 'Balacas', description: 'Balacas cómodas para tu rutina.', fullDescription: 'Balaca elástica para recoger tu cabello mientras aplicas skincare o maquillaje.', price: 8000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-013', name: 'Jabón de Cejas', description: 'Fijación orgánica y natural.', fullDescription: 'Jabón especial para lograr el efecto cejas orgánicas o laminadas, dejándolas intactas.', price: 5000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-014', name: 'Borlas x4', description: 'Juego de borlas para polvo.', fullDescription: 'Kit de 4 borlas suaves e higiénicas para aplicar tus polvos sueltos o compactos.', price: 5000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-015', name: 'Ganchos Rectangulares', description: 'Sujetan el cabello sin marcar.', fullDescription: 'Ganchos modernos diseñados para sujetar mechones sin dejar marcas.', price: 4000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-016', name: 'Cepillo + Laminador de Cejas', description: 'Herramienta para efecto laminado.', fullDescription: 'Cepillo doble diseñado especialmente para peinar y ayudar al laminado de cejas.', price: 3000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-017', name: 'Pegante Adoro para Uñas', description: 'Adhesivo extra fuerte.', fullDescription: 'Adhesivo resistente y duradero ideal para la aplicación de uñas postizas.', price: 5000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-018', name: 'Kit de Cejas Purpure', description: 'Todo lo que necesitas para tus cejas.', fullDescription: 'Kit completo que incluye todo lo necesario para mantener tus cejas definidas y hermosas.', price: 12000, category: 'accesorios', image: '/images/products/placeholder.webp' },
  { id: 'ac-019', name: 'Miñas Negras x5', description: 'Caimanes para peluquería x5.', fullDescription: 'Set de 5 pinzas o miñas negras muy útiles a la hora del peinado o planchado.', price: 2000, category: 'accesorios', image: '/images/products/placeholder.webp' },

  // ==========================================
  // PRODUCTOS PARA EL CABELLO
  // ==========================================
  { id: 'pc-001', name: 'Gel Vibrante', description: 'Fijador de cabello duradero.', fullDescription: 'Gel fijador para todo tipo de peinados que requieran un acabado duradero y firme.', price: 5000, category: 'productos-cabello', image: '/images/products/placeholder.webp' },
  { id: 'pc-002', name: 'Alisadora en Sobre', description: 'Tratamiento alisador práctico.', fullDescription: 'Tratamiento capilar formulado para facilitar el alisado del cabello sin maltratarlo.', price: 7500, category: 'productos-cabello', image: '/images/products/placeholder.webp' },
  { id: 'pc-003', name: 'Pelo Sintético', description: 'Extensiones prácticas.', fullDescription: 'Extensión de cabello sintético ideal para realizar trenzas y diferentes estilos.', price: 7500, category: 'productos-cabello', image: '/images/products/placeholder.webp' },
  { id: 'pc-004', name: 'Polvo de Hadas', description: 'Toque de brillo mágico.', fullDescription: 'Polvo brillante ideal para darle un toque espectacular y festivo a tu cabello.', price: 7000, category: 'productos-cabello', image: '/images/products/placeholder.webp' },
  { id: 'pc-005', name: 'Polvo de Hadas Hello Kitty', description: 'Edición especial Hello Kitty.', fullDescription: 'El clásico polvo de hadas capilar brillante en un hermoso empaque de Hello Kitty.', price: 8000, category: 'productos-cabello', image: '/images/products/placeholder.webp' }
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'todos') return products;
  return products.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}
