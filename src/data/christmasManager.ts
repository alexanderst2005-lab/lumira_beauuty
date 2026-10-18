import fs from 'fs';
import path from 'path';
import os from 'os';
import { ChristmasConfig, DEFAULT_CHRISTMAS_CONFIG } from '@/types/christmas';
import { getStoreConfig } from '@/data/notion';

const PRIMARY_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'christmas.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'lumira_christmas.json');

let inMemoryConfig: ChristmasConfig | null = null;

function sanitizeConfig(raw: any): ChristmasConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CHRISTMAS_CONFIG };
  }

  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : false,
    snow: typeof raw.snow === 'boolean' ? raw.snow : true,
    lights: typeof raw.lights === 'boolean' ? raw.lights : true,
    sparkles: typeof raw.sparkles === 'boolean' ? raw.sparkles : true,
    giftSection: typeof raw.giftSection === 'boolean' ? raw.giftSection : true,
    extraDecor: typeof raw.extraDecor === 'boolean' ? raw.extraDecor : true,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()
  };
}

export function readLocalChristmasConfig(): ChristmasConfig {
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
      return inMemoryConfig ? { ...inMemoryConfig } : { ...DEFAULT_CHRISTMAS_CONFIG };
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeConfig(parsed);
    inMemoryConfig = sanitized;
    return sanitized;
  } catch (err) {
    return inMemoryConfig ? { ...inMemoryConfig } : { ...DEFAULT_CHRISTMAS_CONFIG };
  }
}

export function writeLocalChristmasConfig(config: ChristmasConfig): boolean {
  const sanitized = sanitizeConfig(config);
  inMemoryConfig = { ...sanitized };

  try {
    const dir = path.dirname(PRIMARY_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_DATA_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch {}

  try {
    const tmpDir = path.dirname(TMP_DATA_FILE);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch {}

  return true;
}

/**
 * Consulta la configuración navideña con persistencia en Notion y fallback local
 */
export async function getChristmasConfigAsync(): Promise<ChristmasConfig> {
  try {
    const storeConfig = await getStoreConfig();
    if (storeConfig && storeConfig.christmasConfig) {
      const sanitized = sanitizeConfig(storeConfig.christmasConfig);
      inMemoryConfig = sanitized;
      writeLocalChristmasConfig(sanitized);
      return sanitized;
    }
  } catch (e) {
    console.error('Error fetching christmas config from Notion:', e);
  }

  return readLocalChristmasConfig();
}

/**
 * Guarda la configuración navideña de forma persistente en Notion y localmente
 */
export async function saveChristmasConfigAsync(config: ChristmasConfig): Promise<ChristmasConfig> {
  const sanitized = sanitizeConfig({
    ...config,
    updatedAt: new Date().toISOString()
  });

  // Guardar inmediatamente en memoria y almacenamiento local
  writeLocalChristmasConfig(sanitized);

  // Persistir en Notion en el registro __CONFIG__
  try {
    const storeConfig = await getStoreConfig();
    const token = process.env.NOTION_SECRET;

    if (storeConfig && storeConfig.id && token) {
      const { id, ...rest } = storeConfig;
      const updatedConfig = {
        ...rest,
        christmasConfig: sanitized
      };

      await fetch(`https://api.notion.com/v1/pages/${storeConfig.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          properties: {
            FullDescription: {
              rich_text: [
                {
                  text: {
                    content: JSON.stringify(updatedConfig)
                  }
                }
              ]
            }
          }
        })
      });
    }
  } catch (err) {
    console.error('Error persisting christmas config to Notion:', err);
  }

  return sanitized;
}
