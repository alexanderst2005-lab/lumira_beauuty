export type CampaignFrequency = 'once_per_session' | 'every_24_hours' | 'always';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';

export interface PromotionalCampaign {
  id: string;
  title: string;
  description: string;
  promoBadge?: string;          // ej. "Hasta 30% OFF", "Envío Gratis en Cali", etc.
  imageUrl?: string;
  buttonText?: string;          // ej. "Ver Catálogo"
  buttonUrl?: string;           // ej. "/#catalogo" o ruta de producto
  frequency: CampaignFrequency; // 'once_per_session' | 'every_24_hours' | 'always'
  enabled: boolean;             // Switch manual de activación
  startDate?: string;           // Fecha/hora inicio (YYYY-MM-DDTHH:mm)
  endDate?: string;             // Fecha/hora fin (YYYY-MM-DDTHH:mm)
  status: CampaignStatus;       // 'draft' | 'scheduled' | 'active' | 'paused' | 'ended'
  createdAt: string;
  updatedAt: string;
}
