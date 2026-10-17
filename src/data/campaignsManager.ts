import fs from 'fs';
import path from 'path';
import { PromotionalCampaign, CampaignStatus } from '@/types/campaign';

const PRIMARY_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'campaigns.json');
const TMP_DATA_FILE = path.join('/tmp', 'lumira_campaigns.json');

let inMemoryCampaigns: PromotionalCampaign[] | null = null;

export function evaluateCampaignStatus(campaign: PromotionalCampaign, now: Date = new Date()): CampaignStatus {
  if (!campaign.enabled) {
    return campaign.status === 'draft' ? 'draft' : 'paused';
  }

  if (campaign.startDate) {
    const start = new Date(campaign.startDate);
    if (!isNaN(start.getTime()) && now < start) {
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

    // 1. Revisar si hay copia en memoria
    if (inMemoryCampaigns !== null) {
      const now = new Date();
      return inMemoryCampaigns.map(camp => ({
        ...camp,
        status: evaluateCampaignStatus(camp, now)
      }));
    }

    // 2. Intentar leer de /tmp (si estamos en serverless y se modificó)
    if (fs.existsSync(TMP_DATA_FILE)) {
      try {
        raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
      } catch {}
    }

    // 3. Si no hay en /tmp, leer de archivo principal
    if (!raw && fs.existsSync(PRIMARY_DATA_FILE)) {
      raw = fs.readFileSync(PRIMARY_DATA_FILE, 'utf-8');
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
  let written = false;

  // 1. Intentar escribir en el archivo principal (funciona en local)
  try {
    const dir = path.dirname(PRIMARY_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_DATA_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
    written = true;
  } catch (primaryErr) {
    // En Vercel process.cwd() puede ser de solo lectura
  }

  // 2. Escribir también en /tmp como respaldo para entornos serverless
  try {
    const tmpDir = path.dirname(TMP_DATA_FILE);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(campaigns, null, 2), 'utf-8');
    written = true;
  } catch (tmpErr) {
    // Si /tmp falla, aún conservamos inMemoryCampaigns
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

export function saveCampaign(payload: Partial<PromotionalCampaign>): PromotionalCampaign {
  const campaigns = readCampaigns();
  const now = new Date().toISOString();

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
