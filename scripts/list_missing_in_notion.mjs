import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

async function checkMissing() {
  const response = await fetch(`https://api.notion.com/v1/databases/${PRODUCTS_DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    }
  });

  const data = await response.json();
  const results = data.results || [];

  const publicFiles = fs.readdirSync(path.resolve(__dirname, '../public/images/products'));

  console.log(`\n=== PRODUCTOS EN NOTION QUE NO TIENEN IMAGEN ASIGNADA O USAN PLACEHOLDER ===\n`);

  for (const page of results) {
    const props = page.properties;
    const name = props.Name?.title[0]?.plain_text || 'Sin Nombre';
    if (name === '__CONFIG__') continue;

    let hasImage = false;
    let url = '';
    if (props.Image?.type === 'files' && props.Image.files.length > 0) {
      hasImage = true;
      url = props.Image.files[0].type === 'external' ? props.Image.files[0].external.url : props.Image.files[0].file?.url;
    } else if (props.Image?.type === 'url' && props.Image.url) {
      hasImage = true;
      url = props.Image.url;
    }

    const isPlaceholder = !hasImage || url.includes('placeholder.webp');
    if (isPlaceholder) {
      // Buscar si existe un archivo local en public/images/products/ que coincida con el nombre del producto
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const matchingFile = publicFiles.find(f => f.toLowerCase().includes(cleanName.substring(0, 10)));
      console.log(`❌ ${name.padEnd(45)} | Coincidencia en public/: ${matchingFile || 'Ninguna'}`);
    }
  }
}

checkMissing();
