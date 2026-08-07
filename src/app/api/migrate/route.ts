import { NextResponse } from 'next/server';
import { products } from '@/data/products';

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;

export async function GET() {
  if (!PRODUCTS_DB_ID || !TOKEN) return NextResponse.json({ error: 'Missing DB ID or Token' }, { status: 500 });

  let successCount = 0;
  let errors = [];

  for (const product of products) {
    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: PRODUCTS_DB_ID },
          properties: {
            Name: { title: [{ text: { content: product.name } }] },
            Id: { rich_text: [{ text: { content: product.id } }] },
            Description: { rich_text: [{ text: { content: product.description } }] },
            FullDescription: { rich_text: [{ text: { content: product.fullDescription || product.description } }] },
            Price: { number: product.price },
            Category: { select: { name: product.category } },
            Image: { url: product.image },
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error inserting product');
      }
      successCount++;
    } catch (error) {
      errors.push({ id: product.id, error: error.message });
    }
  }

  return NextResponse.json({ success: true, migrated: successCount, errors });
}
