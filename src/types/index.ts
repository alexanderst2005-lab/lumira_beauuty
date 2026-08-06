export type Category =
  | 'pestanas-punto-a-punto'
  | 'pestanas-enteras'
  | 'makeup'
  | 'skincare'
  | 'corporal'
  | 'productos-cabello'
  | 'accesorios';

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  category: Category;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryInfo {
  id: Category | 'todos';
  name: string;
  emoji: string;
  slug: string;
}
