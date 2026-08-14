import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

async function checkProducts() {
  if (!TOKEN || !PRODUCTS_DB_ID) {
    console.error("Missing token or DB ID");
    return;
  }

  try {
    let allResults = [];
    let hasMore = true;
    let nextCursor = undefined;

    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${PRODUCTS_DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ start_cursor: nextCursor })
      });

      if (!response.ok) {
        console.error("Error querying Notion DB:", await response.text());
        return;
      }

      const data = await response.json();
      allResults = [...allResults, ...data.results];
      hasMore = data.has_more;
      nextCursor = data.next_cursor;
    }

    console.log(`\n=== Total páginas en Notion: ${allResults.length} ===\n`);

    const summary = {
      total: allResults.length,
      hasFiles: 0,
      hasUrlProp: 0,
      emptyImage: 0,
      productsWithEmptyImage: [],
      productsWithExternalUrl: [],
      productsWithNotionFile: []
    };

    for (const page of allResults) {
      const props = page.properties;
      const name = props.Name?.title[0]?.plain_text || 'Sin nombre';
      if (name === '__CONFIG__') continue;

      let images = [];
      if (props.Image?.type === 'files' && props.Image.files.length > 0) {
        images = props.Image.files.map(f => f.type === 'file' ? { type: 'file', url: f.file.url } : { type: 'external', url: f.external.url });
      } else if (props.Image?.type === 'url' && props.Image.url) {
        images = [{ type: 'external', url: props.Image.url }];
      }

      if (images.length === 0) {
        summary.emptyImage++;
        summary.productsWithEmptyImage.push({ id: page.id, name });
      } else {
        if (images[0].type === 'file') {
          summary.hasFiles++;
          summary.productsWithNotionFile.push({ id: page.id, name, url: images[0].url });
        } else {
          summary.hasUrlProp++;
          summary.productsWithExternalUrl.push({ id: page.id, name, url: images[0].url });
        }
      }
    }

    console.log(`Productos sin imagen configurada en Notion: ${summary.emptyImage}`);
    if (summary.productsWithEmptyImage.length > 0) {
      console.log("Lista de productos sin imagen en Notion:");
      summary.productsWithEmptyImage.forEach(p => console.log(` - ${p.name}`));
    }

    console.log(`\nProductos con imagen Externa: ${summary.hasUrlProp}`);
    console.log(`Productos con imagen subida en Notion (S3): ${summary.hasFiles}`);

    // Verificar si las URLs externas son alcanzables
    console.log("\n--- Probando URLs externas ---");
    for (const p of summary.productsWithExternalUrl) {
      try {
        const res = await fetch(p.url, { method: 'HEAD' });
        if (!res.ok) {
          console.log(`❌ ALERTA URL ROTA (${res.status}): ${p.name} -> ${p.url}`);
        } else {
          console.log(`✅ OK (${res.status}): ${p.name}`);
        }
      } catch (err) {
        console.log(`❌ ERROR CONEXION: ${p.name} -> ${p.url} (${err.message})`);
      }
    }

  } catch (err) {
    console.error("Error al ejecutar:", err);
  }
}

checkProducts();
