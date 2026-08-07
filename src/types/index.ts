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

export interface ProductOptionValue {
  name: string;
  image?: string;
  hex?: string;
}

export interface ProductOption {
  name: string;
  values: ProductOptionValue[];
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
  tones?: Tone[]; // Deprecated, use options
  options?: ProductOption[];
  stock?: number;
  active?: boolean;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
  inTrash?: boolean;
}

export interface CartItem {
  id: string; // Unique cart item ID: productId + selected options
  product: Product;
  quantity: number;
  selectedTone?: Tone; // Deprecated
  selectedOptions?: Record<string, ProductOptionValue>;
}

export interface CategoryInfo {
  id: Category | 'todos';
  name: string;
  emoji: string;
  slug: string;
}
