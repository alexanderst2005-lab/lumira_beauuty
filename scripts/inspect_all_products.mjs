import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

async function inspectAll() {
  if (!TOKEN || !PRODUCTS_DB_ID) {
    console.error("Missing token or DB ID");
    return;
  }

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

  console.log(`\n=== Lista de todos los productos en Notion (${results.length}) ===\n`);

  const publicFiles = fs.readdirSync(path.resolve(__dirname, '../public/images/products'));
  console.log(`Archivos disponibles en public/images/products/ (${publicFiles.length}):`);
  console.log(publicFiles.join(', '));
  console.log('\n----------------------------------------------------\n');

  for (const page of results) {
    const props = page.properties;
    const name = props.Name?.title[0]?.plain_text || 'Sin Nombre';
    if (name === '__CONFIG__') continue;

    let imageUrl = 'Sin Imagen';
    if (props.Image?.type === 'files' && props.Image.files.length > 0) {
      const first = props.Image.files[0];
      imageUrl = first.type === 'external' ? first.external.url : (first.file?.url || '');
    } else if (props.Image?.type === 'url' && props.Image.url) {
      imageUrl = props.Image.url;
    }

    console.log(`- ${name.padEnd(45)} -> ${imageUrl}`);
  }
}

inspectAll();
