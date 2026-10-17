import fs from 'fs';
import path from 'path';
import { PromotionalCampaign, CampaignStatus } from '@/types/campaign';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'campaigns.json');

const DEFAULT_CAMPAIGNS: PromotionalCampaign[] = [
  {
    id: 'camp-default-01',
    title: '¡Descubre la Magia de Lumira Beauty!',
    description: 'Explora nuestra colección exclusiva de cuidado facial, maquillaje y pestañas. Calidad profesional y atención personalizada.',
    promoBadge: 'Envío Gratis en Cali',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000',
    buttonText: 'Explorar Catálogo',
    buttonUrl: '/#catalogo',
    frequency: 'once_per_session',
    enabled: false,
    startDate: '',
    endDate: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function evaluateCampaignStatus(campaign: PromotionalCampaign, now: Date = new Date()): CampaignStatus {
  // Si está deshabilitada manualmente por el switch
  if (!campaign.enabled) {
    return campaign.status === 'draft' ? 'draft' : 'paused';
  }

  // Si tiene fecha de inicio futura
  if (campaign.startDate) {
    const start = new Date(campaign.startDate);
    if (!isNaN(start.getTime()) && now < start) {
      return 'scheduled';
    }
  }

  // Si tiene fecha de fin ya expirada
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
    if (!fs.existsSync(DATA_FILE)) {
      writeCampaigns(DEFAULT_CAMPAIGNS);
      return DEFAULT_CAMPAIGNS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CAMPAIGNS;

    const now = new Date();
    return parsed.map((camp: PromotionalCampaign) => ({
      ...camp,
      status: evaluateCampaignStatus(camp, now)
    }));
  } catch (error) {
    console.error('Error reading campaigns file:', error);
    return DEFAULT_CAMPAIGNS;
  }
}

export function writeCampaigns(campaigns: PromotionalCampaign[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing campaigns file:', error);
    return false;
  }
}

export function getActiveCampaign(): PromotionalCampaign | null {
  const campaigns = readCampaigns();
  const now = new Date();
  
  // Buscar la primera campaña que esté estrictamente activa y vigente
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

export function saveCampaign(payload: Partial<PromotionalCampaign>): PromotionalCampaign {
  const campaigns = readCampaigns();
  const now = new Date().toISOString();

  if (payload.id) {
    // Editar existente
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
        status: 'draft' // se recalcula dinámicamente con evaluateCampaignStatus
      };
      updated.status = evaluateCampaignStatus(updated, new Date());
      campaigns[index] = updated;
      writeCampaigns(campaigns);
      return updated;
    }
  }

  // Crear nueva
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
  if (filtered.length !== campaigns.length) {
    return writeCampaigns(filtered);
  }
  return false;
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
