export type Category =
  | 'pestanas-punto-a-punto'
  | 'pestanas-enteras'
  | 'makeup'
  | 'skincare'
  | 'corporal'
  | 'productos-cabello'
  | 'accesorios';

export interface Tone {
  name: string;
  hex: string;
}

export interface Product {
  id: string; // The URL/slug ID
  notionId?: string; // The actual Notion Page ID used for updates/deletes
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  category: Category;
  image: string;
  images?: string[];
  tones?: Tone[];
  stock?: number;
  active?: boolean;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
}

export interface CartItem {
  id: string; // Unique cart item ID: productId + selectedTone (if any)
  product: Product;
  quantity: number;
  selectedTone?: Tone;
}

export interface CategoryInfo {
  id: Category | 'todos';
  name: string;
  emoji: string;
  slug: string;
}
