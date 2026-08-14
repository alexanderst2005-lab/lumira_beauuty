import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

async function fixNotionUrls() {
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
        console.error("Error querying Notion DB");
        return;
      }

      const data = await response.json();
      allResults = [...allResults, ...data.results];
      hasMore = data.has_more;
      nextCursor = data.next_cursor;
    }

    console.log(`Buscando productos en Notion con URLs de githubusercontent.com...`);
    let fixedCount = 0;

    for (const page of allResults) {
      const props = page.properties;
      const name = props.Name?.title[0]?.plain_text || 'Sin nombre';
      if (name === '__CONFIG__') continue;

      let isGithubRaw = false;
      let rawUrl = '';

      if (props.Image?.type === 'files' && props.Image.files.length > 0) {
        const first = props.Image.files[0];
        const url = first.type === 'external' ? first.external.url : (first.file?.url || '');
        if (url.includes('githubusercontent.com')) {
          isGithubRaw = true;
          rawUrl = url;
        }
      } else if (props.Image?.type === 'url' && props.Image.url) {
        if (props.Image.url.includes('githubusercontent.com')) {
          isGithubRaw = true;
          rawUrl = props.Image.url;
        }
      }

      if (isGithubRaw) {
        // Extraer la ruta estática local rel. ej. /images/products/colageno-labios-bioaqua.png
        let cleanPath = rawUrl;
        if (cleanPath.includes('/public/')) {
          cleanPath = cleanPath.substring(cleanPath.indexOf('/public/') + 7);
        } else if (cleanPath.includes('/images/')) {
          cleanPath = cleanPath.substring(cleanPath.indexOf('/images/'));
        }

        // Construir la URL completa absoluta usando la tienda Vercel o la ruta estática
        const absoluteUrl = `https://lumirabeauuty.vercel.app${cleanPath}`;

        console.log(`Corrigiendo producto en Notion: ${name}`);
        console.log(`  De: ${rawUrl}`);
        console.log(`  A:  ${absoluteUrl}`);

        const updateRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          },
          body: JSON.stringify({
            properties: {
              Image: {
                files: [
                  {
                    name: 'image_0.jpg',
                    type: 'external',
                    external: { url: absoluteUrl }
                  }
                ]
              }
            }
          })
        });

        if (updateRes.ok) {
          console.log(`  ✅ Actualizado con éxito en Notion\n`);
          fixedCount++;
        } else {
          console.error(`  ❌ Error al actualizar en Notion:`, await updateRes.text());
        }
      }
    }

    console.log(`\n=== Proceso completado. Se corrigieron ${fixedCount} productos en Notion. ===\n`);

  } catch (err) {
    console.error("Error en script:", err);
  }
}

fixNotionUrls();
