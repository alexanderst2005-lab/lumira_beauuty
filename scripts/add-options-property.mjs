import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

async function updateDatabase() {
  if (!TOKEN || !PRODUCTS_DB_ID) {
    console.error('Missing Notion Token or Products DB ID');
    process.exit(1);
  }

  try {
    console.log(`Actualizando base de datos de Productos (${PRODUCTS_DB_ID})...`);
    const response = await fetch(`https://api.notion.com/v1/databases/${PRODUCTS_DB_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        properties: {
          Options: { rich_text: {} }
        }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error updating database');
    }
    
    console.log('✅ BD Productos actualizada. Se añadió la columna "Options".');
  } catch (error) {
    console.error('❌ Error actualizando BD:', error.message);
  }
}

updateDatabase();
