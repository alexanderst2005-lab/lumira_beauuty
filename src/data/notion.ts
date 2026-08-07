import { Product } from '@/types';

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;
const ORDERS_DB_ID = process.env.NOTION_ORDERS_DB;

/**
 * Obtiene todos los productos desde la base de datos de Notion
 */
export async function getAllProductsFromNotion(): Promise<Product[]> {
  if (!PRODUCTS_DB_ID || !TOKEN) {
    console.error('No Notion DB ID or Token configured');
    return [];
  }

  try {
    let allResults: any[] = [];
    let hasMore = true;
    let nextCursor = undefined;

    while (hasMore) {
      const response: Response = await fetch(`https://api.notion.com/v1/databases/${PRODUCTS_DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          start_cursor: nextCursor
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Error querying Notion DB');
      }

      const data: any = await response.json();
      allResults = [...allResults, ...data.results];
      
      hasMore = data.has_more;
      nextCursor = data.next_cursor;
    }

    return allResults.map((page: any) => {
      const props = page.properties;
      return {
        id: props.Id?.rich_text[0]?.plain_text || page.id,
        name: props.Name?.title[0]?.plain_text || 'Sin nombre',
        description: props.Description?.rich_text[0]?.plain_text || '',
        fullDescription: props.FullDescription?.rich_text[0]?.plain_text || '',
        price: props.Price?.number || 0,
        category: props.Category?.select?.name || 'todos',
        image: props.Image?.url || '/images/products/placeholder.webp',
      };
    });
  } catch (error) {
    console.error('Error fetching products from Notion:', error);
    return [];
  }
}
