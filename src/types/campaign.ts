export type CampaignFrequency = 'once_per_session' | 'every_24_hours' | 'always';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';

export type DiscountType = 'percentage' | 'fixed_price';

export interface CampaignProductDiscount {
  productId: string;
  productName: string;
  productImage?: string;
  basePrice: number;
  discountType: DiscountType; // 'percentage' | 'fixed_price'
  discountValue: number;      // porcentaje (ej. 20) o precio promocional (ej. 35000)
  discountPrice: number;      // precio final en pesos colombianos ($ COP)
  discountPercent: number;    // porcentaje calculado (ej. 20)
  savings: number;            // ahorro del cliente en pesos colombianos ($ COP)
}

export interface PromotionalCampaign {
  id: string;
  title: string;
  description: string;
  promoBadge?: string;          // ej. "Hasta 30% OFF", "Envío Gratis en Cali", etc.
  imageUrl?: string;
  buttonText?: string;          // ej. "Ver Ofertas"
  buttonUrl?: string;           // ej. "/catalogo?ofertas=true" o ruta de producto
  frequency: CampaignFrequency; // 'once_per_session' | 'every_24_hours' | 'always'
  enabled: boolean;             // Switch manual de activación
  startDate?: string;           // Fecha/hora inicio (YYYY-MM-DDTHH:mm)
  endDate?: string;             // Fecha/hora fin (YYYY-MM-DDTHH:mm)
  status: CampaignStatus;       // 'draft' | 'scheduled' | 'active' | 'paused' | 'ended'
  products?: CampaignProductDiscount[]; // Productos reales con descuento asociados a la campaña
  createdAt: string;
  updatedAt: string;
}
