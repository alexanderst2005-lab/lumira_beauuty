import fs from 'fs';
import path from 'path';
import os from 'os';
import { PromotionalCampaign, CampaignStatus, CampaignProductDiscount } from '@/types/campaign';

function getNotionConfig() {
  const token = process.env.NOTION_SECRET;
  const dbId = process.env.NOTION_CAMPAIGNS_DB || '3fdd482d-cfe4-81c4-9b43-d35e961bfdaf';
  return { token, dbId };
}

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

function readLocalCampaigns(): PromotionalCampaign[] {
  try {
    let raw: string | null = null;

    if (fs.existsSync(PRIMARY_DATA_FILE)) {
      try {
        raw = fs.readFileSync(PRIMARY_DATA_FILE, 'utf-8');
      } catch {}
    }

    if (!raw && fs.existsSync(TMP_DATA_FILE)) {
      try {
        raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
      } catch {}
    }

    if (!raw) {
      return inMemoryCampaigns || [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = new Date();
    return parsed.map((camp: PromotionalCampaign) => ({
      ...camp,
      status: evaluateCampaignStatus(camp, now)
    }));
  } catch (err) {
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
  } catch {}

  try {
    const tmpDir = path.dirname(TMP_DATA_FILE);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
  } catch {}

  return true;
}

export function readCampaigns(): PromotionalCampaign[] {
  if (inMemoryCampaigns !== null) {
    const now = new Date();
    return inMemoryCampaigns.map(c => ({
      ...c,
      status: evaluateCampaignStatus(c, now)
    }));
  }
  return readLocalCampaigns();
}

/**
 * Consulta las campañas guardadas en Notion (fuente de verdad permanente y compartida en Vercel)
 */
export async function getCampaignsAsync(): Promise<PromotionalCampaign[]> {
  const { token, dbId } = getNotionConfig();
  if (!token) {
    return readLocalCampaigns();
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 100
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      return readLocalCampaigns();
    }

    const data = await res.json();
    const now = new Date();
    const campaigns: PromotionalCampaign[] = [];

    for (const page of data.results || []) {
      try {
        const rawData = page.properties?.Data?.rich_text?.[0]?.plain_text;
        let parsed: any = null;
        if (rawData) {
          parsed = JSON.parse(rawData);
        } else {
          // Extraer desde propiedades de la página si Data viniera vacío
          parsed = {
            id: page.id,
            title: page.properties?.Title?.title?.[0]?.plain_text || 'Campaña',
            enabled: page.properties?.Enabled?.checkbox ?? true,
            status: page.properties?.Status?.select?.name || 'active',
            products: []
          };
        }

        if (parsed) {
          const camp: PromotionalCampaign = {
            ...parsed,
            id: page.id,
            enabled: page.properties?.Enabled?.checkbox !== undefined 
              ? page.properties.Enabled.checkbox 
              : (parsed.enabled ?? true),
            status: evaluateCampaignStatus({
              ...parsed,
              enabled: page.properties?.Enabled?.checkbox !== undefined 
                ? page.properties.Enabled.checkbox 
                : (parsed.enabled ?? true)
            }, now)
          };
          campaigns.push(camp);
        }
      } catch (e) {
        console.error('Error parsing Notion campaign page:', e);
      }
    }

    inMemoryCampaigns = [...campaigns];
    writeCampaigns(campaigns);
    return campaigns;
  } catch (err) {
    console.error('Error fetching campaigns from Notion:', err);
    return readLocalCampaigns();
  }
}

/**
 * Guarda o actualiza una campaña en Notion y en la caché local
 */
export async function saveCampaignAsync(payload: Partial<PromotionalCampaign>): Promise<PromotionalCampaign> {
  const { token, dbId } = getNotionConfig();
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

  const campaignData: PromotionalCampaign = {
    id: payload.id || `camp-${Date.now()}`,
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

  campaignData.status = evaluateCampaignStatus(campaignData, new Date());

  if (token) {
    try {
      const isNotionPageId = payload.id && /^[a-f0-9-]{36}$/i.test(payload.id);

      if (isNotionPageId) {
        // Actualizar página existente en Notion
        await fetch(`https://api.notion.com/v1/pages/${payload.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            properties: {
              Title: { title: [{ text: { content: campaignData.title } }] },
              Enabled: { checkbox: campaignData.enabled },
              Status: { select: { name: campaignData.status } },
              Data: { rich_text: [{ text: { content: JSON.stringify(campaignData) } }] }
            }
          })
        });
        campaignData.id = payload.id!;
      } else {
        // Crear nueva página en Notion
        const res = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            parent: { database_id: dbId },
            properties: {
              Title: { title: [{ text: { content: campaignData.title } }] },
              Enabled: { checkbox: campaignData.enabled },
              Status: { select: { name: campaignData.status } },
              Data: { rich_text: [{ text: { content: JSON.stringify(campaignData) } }] }
            }
          })
        });

        if (res.ok) {
          const newPage = await res.json();
          campaignData.id = newPage.id;
        } else {
          const errText = await res.text();
          console.error('Notion page create error:', res.status, errText);
        }
      }
    } catch (notionErr) {
      console.error('Error saving campaign to Notion:', notionErr);
    }
  }

  // Sincronizar en memoria y almacenamiento local
  const currentLocal = readLocalCampaigns().filter(c => c.id !== campaignData.id);
  writeCampaigns([campaignData, ...currentLocal]);
  return campaignData;
}

/**
 * Elimina (archiva) una campaña en Notion de forma permanente
 */
export async function deleteCampaignAsync(id: string): Promise<boolean> {
  const { token, dbId } = getNotionConfig();

  if (token && id) {
    try {
      const isNotionPageId = /^[a-f0-9-]{36}$/i.test(id);
      if (isNotionPageId) {
        await fetch(`https://api.notion.com/v1/pages/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({ archived: true })
        });
      } else {
        // Si el id es camp-xxx, buscar la página correspondiente en la BD de Notion
        const qRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          }
        });
        if (qRes.ok) {
          const qData = await qRes.json();
          for (const page of qData.results || []) {
            const rawData = page.properties?.Data?.rich_text?.[0]?.plain_text;
            if (page.id === id || (rawData && rawData.includes(id))) {
              await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify({ archived: true })
              });
            }
          }
        }
      }
    } catch (notionErr) {
      console.error('Error archiving campaign in Notion:', notionErr);
    }
  }

  // Actualizar caché local
  deleteCampaign(id);
  return true;
}

/**
 * Activa o desactiva una campaña en Notion y en memoria
 */
export async function toggleCampaignAsync(id: string): Promise<PromotionalCampaign | null> {
  const { token } = getNotionConfig();
  const campaigns = await getCampaignsAsync();
  const target = campaigns.find(c => c.id === id);
  if (!target) return null;

  const newEnabled = !target.enabled;
  const now = new Date();
  const newStatus = evaluateCampaignStatus({
    ...target,
    enabled: newEnabled
  }, now);

  const updated: PromotionalCampaign = {
    ...target,
    enabled: newEnabled,
    status: newStatus,
    updatedAt: now.toISOString()
  };

  if (token && /^[a-f0-9-]{36}$/i.test(id)) {
    try {
      await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          properties: {
            Enabled: { checkbox: newEnabled },
            Status: { select: { name: newStatus } },
            Data: { rich_text: [{ text: { content: JSON.stringify(updated) } }] }
          }
        })
      });
    } catch (err) {
      console.error('Error toggling campaign in Notion:', err);
    }
  }

  const newCampaigns = campaigns.map(c => c.id === id ? updated : c);
  writeCampaigns(newCampaigns);
  return updated;
}

export async function getActiveCampaignAsync(): Promise<PromotionalCampaign | null> {
  const campaigns = await getCampaignsAsync();
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

export async function getActiveDiscountsMapAsync(): Promise<Record<string, CampaignProductDiscount & { campaignId: string; campaignTitle: string }>> {
  const activeCampaign = await getActiveCampaignAsync();
  if (!activeCampaign || !activeCampaign.products || activeCampaign.products.length === 0) {
    return {};
  }

  const map: Record<string, CampaignProductDiscount & { campaignId: string; campaignTitle: string }> = {};
  for (const item of activeCampaign.products) {
    if (item.productId) {
      map[item.productId] = {
        ...item,
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title
      };
    }
  }

  return map;
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

export function getActiveDiscountsMap(): Record<string, CampaignProductDiscount & { campaignId: string; campaignTitle: string }> {
  const activeCampaign = getActiveCampaign();
  if (!activeCampaign || !activeCampaign.products || activeCampaign.products.length === 0) {
    return {};
  }

  const map: Record<string, CampaignProductDiscount & { campaignId: string; campaignTitle: string }> = {};
  for (const item of activeCampaign.products) {
    if (item.productId) {
      map[item.productId] = {
        ...item,
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title
      };
    }
  }

  return map;
}

export function validateItemPrice(
  productId: string, 
  basePrice: number, 
  individualOriginalPrice?: number
): { finalPrice: number; originalPrice?: number; hasDiscount: boolean; discountPercent: number; savings: number; discountSource?: string; campaignTitle?: string } {
  const hasIndividualOffer = Boolean(
    individualOriginalPrice && 
    Number(individualOriginalPrice) > Number(basePrice) && 
    Number(basePrice) > 0
  );
  const originalCatalogPrice = hasIndividualOffer && individualOriginalPrice ? Number(individualOriginalPrice) : basePrice;

  const discounts = getActiveDiscountsMap();
  const campOffer = discounts[productId];

  let campaignFinalPrice = originalCatalogPrice;
  let hasCampaignOffer = false;

  if (campOffer && originalCatalogPrice > 0) {
    if (campOffer.discountType === 'percentage') {
      const percent = Math.min(99, Math.max(1, campOffer.discountValue));
      campaignFinalPrice = Math.round(originalCatalogPrice * (1 - percent / 100));
    } else {
      campaignFinalPrice = Math.round(campOffer.discountValue);
    }
    if (campaignFinalPrice > 0 && campaignFinalPrice < originalCatalogPrice) {
      hasCampaignOffer = true;
    }
  }

  if (hasCampaignOffer && hasIndividualOffer) {
    if (campaignFinalPrice <= basePrice) {
      const savings = originalCatalogPrice - campaignFinalPrice;
      const discountPercent = Math.round((savings / originalCatalogPrice) * 100);
      return {
        finalPrice: campaignFinalPrice,
        originalPrice: originalCatalogPrice,
        hasDiscount: true,
        discountPercent,
        savings,
        discountSource: 'campaign',
        campaignTitle: campOffer?.campaignTitle
      };
    } else {
      const savings = originalCatalogPrice - basePrice;
      const discountPercent = Math.round((savings / originalCatalogPrice) * 100);
      return {
        finalPrice: basePrice,
        originalPrice: originalCatalogPrice,
        hasDiscount: true,
        discountPercent,
        savings,
        discountSource: 'individual'
      };
    }
  }

  if (hasCampaignOffer) {
    const savings = originalCatalogPrice - campaignFinalPrice;
    const discountPercent = Math.round((savings / originalCatalogPrice) * 100);
    return {
      finalPrice: campaignFinalPrice,
      originalPrice: originalCatalogPrice,
      hasDiscount: true,
      discountPercent,
      savings,
      discountSource: 'campaign',
      campaignTitle: campOffer?.campaignTitle
    };
  }

  if (hasIndividualOffer) {
    const savings = originalCatalogPrice - basePrice;
    const discountPercent = Math.round((savings / originalCatalogPrice) * 100);
    return {
      finalPrice: basePrice,
      originalPrice: originalCatalogPrice,
      hasDiscount: true,
      discountPercent,
      savings,
      discountSource: 'individual'
    };
  }

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
  inMemoryCampaigns = [...filtered];
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
