import fs from 'fs';
import path from 'path';
import { PromotionalCampaign, CampaignStatus, CampaignProductDiscount } from '@/types/campaign';

import os from 'os';

const PRIMARY_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'campaigns.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'lumira_campaigns.json');

let inMemoryCampaigns: PromotionalCampaign[] | null = null;

export function evaluateCampaignStatus(campaign: PromotionalCampaign, now: Date = new Date()): CampaignStatus {
  if (!campaign.enabled) {
    return campaign.status === 'draft' ? 'draft' : 'paused';
  }

  if (campaign.startDate) {
    const start = new Date(campaign.startDate);
    // Tolerancia de 15 minutos para evitar que desfases horarios cliente-servidor marquen la campaña como programada en vez de activa
    if (!isNaN(start.getTime()) && (start.getTime() - now.getTime()) > 15 * 60 * 1000) {
      return 'scheduled';
    }
  }

  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    if (!isNaN(end.getTime()) && now > end) {
      return 'ended';
    }
  }

  return 'active';
}

export function readCampaigns(): PromotionalCampaign[] {
  try {
    let raw: string | null = null;

    // 1. Siempre dar prioridad al archivo principal del repositorio
    if (fs.existsSync(PRIMARY_DATA_FILE)) {
      try {
        raw = fs.readFileSync(PRIMARY_DATA_FILE, 'utf-8');
      } catch (err) {
        console.warn('Could not read PRIMARY_DATA_FILE, trying temp fallback:', err);
      }
    }

    // 2. Si no hay archivo principal o falló, intentar de tmpdir
    if (!raw && fs.existsSync(TMP_DATA_FILE)) {
      try {
        raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
      } catch {}
    }

    // 3. Si no hay archivos, revisar si existe copia en memoria
    if (!raw && inMemoryCampaigns !== null) {
      const now = new Date();
      return inMemoryCampaigns.map(camp => ({
        ...camp,
        status: evaluateCampaignStatus(camp, now)
      }));
    }

    if (!raw) {
      inMemoryCampaigns = [];
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      inMemoryCampaigns = [];
      return [];
    }

    inMemoryCampaigns = parsed;
    const now = new Date();
    return parsed.map((camp: PromotionalCampaign) => ({
      ...camp,
      status: evaluateCampaignStatus(camp, now)
    }));
  } catch (error) {
    console.error('Error reading campaigns:', error);
    return inMemoryCampaigns || [];
  }
}

export function writeCampaigns(campaigns: PromotionalCampaign[]): boolean {
  inMemoryCampaigns = [...campaigns];

  try {
    const dir = path.dirname(PRIMARY_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_DATA_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
  } catch (primaryErr) {
    console.warn('Could not write to PRIMARY_DATA_FILE (e.g. read-only env):', primaryErr);
  }

  try {
    const tmpDir = path.dirname(TMP_DATA_FILE);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
  } catch (tmpErr) {
    // Si temp falla, conservamos inMemoryCampaigns
  }

  return true;
}

export function getActiveCampaign(): PromotionalCampaign | null {
  const campaigns = readCampaigns();
  const now = new Date();
  
  for (const campaign of campaigns) {
    const status = evaluateCampaignStatus(campaign, now);
    if (status === 'active') {
      return {
        ...campaign,
        status: 'active'
      };
    }
  }

  return null;
}

/**
 * Obtiene el mapa de descuentos vigentes de la campaña activa
 */
export function getActiveDiscountsMap(): Record<string, CampaignProductDiscount & { campaignId: string; campaignTitle: string }> {
  const activeCampaign = getActiveCampaign();
  if (!activeCampaign || !activeCampaign.products || activeCampaign.products.length === 0) {
    return {};
  }

  const map: Record<string, CampaignProductDiscount & { campaignId: string; campaignTitle: string }> = {};
  for (const item of activeCampaign.products) {
    if (item.productId && item.discountPrice > 0) {
      map[item.productId] = {
        ...item,
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title
      };
    }
  }
  return map;
}

/**
 * Valida de forma segura el precio de un producto en el backend (para Carrito y Checkout)
 */
export function validateItemPrice(
  productId: string, 
  basePrice: number, 
  individualOriginalPrice?: number
): {
  finalPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  savings: number;
  discountSource?: 'campaign' | 'individual' | 'best_offer';
  campaignId?: string;
  campaignTitle?: string;
} {
  const hasValidIndividual = Boolean(
    individualOriginalPrice && 
    Number(individualOriginalPrice) > Number(basePrice) && 
    Number(basePrice) > 0
  );
  const individualOrig = hasValidIndividual && individualOriginalPrice ? Number(individualOriginalPrice) : basePrice;
  const individualPrice = Number(basePrice);

  const discounts = getActiveDiscountsMap();
  const discountInfo = discounts[productId];

  let hasValidCampaign = false;
  let campaignFinalPrice = individualOrig;

  if (discountInfo && individualOrig > 0) {
    if (discountInfo.discountType === 'percentage') {
      const percent = Math.min(99, Math.max(1, discountInfo.discountValue));
      campaignFinalPrice = Math.round(individualOrig * (1 - percent / 100));
    } else {
      campaignFinalPrice = Math.round(discountInfo.discountValue);
    }

    if (campaignFinalPrice > 0 && campaignFinalPrice < individualOrig) {
      hasValidCampaign = true;
    }
  }

  // Caso A: Ambos existen -> Regla explícita: aplicar el menor precio promocional (mejor oferta)
  if (hasValidCampaign && hasValidIndividual) {
    const bestPrice = Math.min(campaignFinalPrice, individualPrice);
    const savings = Math.max(0, individualOrig - bestPrice);
    const discountPercent = Math.round((savings / individualOrig) * 100);
    return {
      finalPrice: bestPrice,
      originalPrice: individualOrig,
      hasDiscount: true,
      discountPercent,
      savings,
      discountSource: bestPrice === campaignFinalPrice ? 'campaign' : 'individual',
      campaignId: bestPrice === campaignFinalPrice ? discountInfo?.campaignId : undefined,
      campaignTitle: bestPrice === campaignFinalPrice ? discountInfo?.campaignTitle : undefined
    };
  }

  // Caso B: Solo campaña válida
  if (hasValidCampaign && discountInfo) {
    const savings = Math.max(0, individualOrig - campaignFinalPrice);
    const discountPercent = Math.round((savings / individualOrig) * 100);
    return {
      finalPrice: campaignFinalPrice,
      originalPrice: individualOrig,
      hasDiscount: true,
      discountPercent,
      savings,
      discountSource: 'campaign',
      campaignId: discountInfo.campaignId,
      campaignTitle: discountInfo.campaignTitle
    };
  }

  // Caso C: Solo oferta individual válida
  if (hasValidIndividual) {
    const savings = Math.max(0, individualOrig - individualPrice);
    const discountPercent = Math.round((savings / individualOrig) * 100);
    return {
      finalPrice: individualPrice,
      originalPrice: individualOrig,
      hasDiscount: true,
      discountPercent,
      savings,
      discountSource: 'individual'
    };
  }

  // Caso D: Sin descuento
  return {
    finalPrice: basePrice,
    originalPrice: basePrice,
    hasDiscount: false,
    discountPercent: 0,
    savings: 0
  };
}

export function saveCampaign(payload: Partial<PromotionalCampaign>): PromotionalCampaign {
  const campaigns = readCampaigns();
  const now = new Date().toISOString();

  // Validar y limpiar productos con descuento
  const cleanedProducts: CampaignProductDiscount[] = Array.isArray(payload.products)
    ? payload.products
        .filter(p => p.productId && p.basePrice > 0)
        .map(p => {
          let discPrice = p.discountPrice;
          let discPercent = p.discountPercent;
          let savings = p.savings;

          if (p.discountType === 'percentage') {
            const percent = Math.min(99, Math.max(1, Number(p.discountValue) || 1));
            discPrice = Math.round(p.basePrice * (1 - percent / 100));
            savings = Math.max(0, p.basePrice - discPrice);
            discPercent = percent;
          } else {
            const fixedPrice = Math.round(Number(p.discountValue) || p.discountPrice);
            discPrice = Math.min(fixedPrice, p.basePrice - 1);
            if (discPrice <= 0) discPrice = Math.round(p.basePrice * 0.9);
            savings = Math.max(0, p.basePrice - discPrice);
            discPercent = Math.round((savings / p.basePrice) * 100);
          }

          return {
            productId: p.productId,
            productName: p.productName,
            productImage: p.productImage || '',
            basePrice: p.basePrice,
            discountType: p.discountType || 'percentage',
            discountValue: Number(p.discountValue) || 0,
            discountPrice: discPrice,
            discountPercent: discPercent,
            savings: savings
          };
        })
    : [];

  if (payload.id) {
    const index = campaigns.findIndex(c => c.id === payload.id);
    if (index !== -1) {
      const existing = campaigns[index];
      const updated: PromotionalCampaign = {
        ...existing,
        ...payload,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
        enabled: payload.enabled !== undefined ? payload.enabled : existing.enabled,
        products: cleanedProducts,
        status: 'draft'
      };
      updated.status = evaluateCampaignStatus(updated, new Date());
      campaigns[index] = updated;
      writeCampaigns(campaigns);
      return updated;
    }
  }

  const newCampaign: PromotionalCampaign = {
    id: `camp-${Date.now()}`,
    title: payload.title || 'Nueva Campaña Promocional',
    description: payload.description || '',
    promoBadge: payload.promoBadge || '',
    imageUrl: payload.imageUrl || '',
    buttonText: payload.buttonText || '',
    buttonUrl: payload.buttonUrl || '',
    frequency: payload.frequency || 'once_per_session',
    enabled: payload.enabled ?? true,
    startDate: payload.startDate || '',
    endDate: payload.endDate || '',
    products: cleanedProducts,
    status: 'draft',
    createdAt: now,
    updatedAt: now
  };

  newCampaign.status = evaluateCampaignStatus(newCampaign, new Date());
  campaigns.unshift(newCampaign);
  writeCampaigns(campaigns);
  return newCampaign;
}

export function deleteCampaign(id: string): boolean {
  const campaigns = readCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  writeCampaigns(filtered);
  return true;
}

export function toggleCampaign(id: string): PromotionalCampaign | null {
  const campaigns = readCampaigns();
  const index = campaigns.findIndex(c => c.id === id);
  if (index === -1) return null;

  const camp = campaigns[index];
  camp.enabled = !camp.enabled;
  camp.updatedAt = new Date().toISOString();
  camp.status = evaluateCampaignStatus(camp, new Date());
  
  campaigns[index] = camp;
  writeCampaigns(campaigns);
  return camp;
}
