import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const PAGE_ID = '3b4d482dcfe48005a69cd66d3ba1347a';
const TOKEN = process.env.NOTION_SECRET;

async function createDatabase(title, properties) {
  const response = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: PAGE_ID },
      title: [{ type: 'text', text: { content: title } }],
      properties
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error creating database');
  }
  return data;
}

async function main() {
  try {
    console.log('Creando base de datos de Productos...');
    const productsDb = await createDatabase('Catálogo de Productos - Lumira', {
      Name: { title: {} },
      Id: { rich_text: {} },
      Description: { rich_text: {} },
      FullDescription: { rich_text: {} },
      Price: { number: { format: 'number' } },
      Category: { select: {} },
      Image: { url: {} },
    });
    console.log('✅ BD Productos Creada:', productsDb.id);

    console.log('Creando base de datos de Pedidos...');
    const ordersDb = await createDatabase('Pedidos WhatsApp - Lumira', {
      Name: { title: {} }, // Nombre del Cliente
      WhatsApp: { phone_number: {} },
      City: { rich_text: {} },
      Address: { rich_text: {} },
      Neighborhood: { rich_text: {} },
      Products: { rich_text: {} }, // Lista en texto
      Tones: { rich_text: {} }, // Lista de tonos
      Total: { number: { format: 'number' } },
      Status: {
        select: {
          options: [
            { name: 'Pendiente', color: 'red' },
            { name: 'Confirmado', color: 'yellow' },
            { name: 'En preparación', color: 'blue' },
            { name: 'Enviado', color: 'purple' },
            { name: 'Entregado', color: 'green' }
          ]
        }
      },
      Date: { date: {} },
    });
    console.log('✅ BD Pedidos Creada:', ordersDb.id);

  } catch (error) {
    console.error('❌ Error creando BDs:', error.message);
  }
}
main();
