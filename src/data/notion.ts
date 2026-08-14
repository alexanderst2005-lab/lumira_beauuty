import { Product } from '@/types';
import { processAndCacheNotionUrl } from '@/utils/imageServerCache';

const TOKEN = process.env.NOTION_SECRET;
const PRODUCTS_DB_ID = process.env.NOTION_PRODUCTS_DB;
const ORDERS_DB_ID = process.env.NOTION_ORDERS_DB;

/**
 * Obtiene todos los productos desde la base de datos de Notion
 */
export async function getAllProductsFromNotion(includeTrash = false): Promise<Product[]> {
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
        next: { revalidate: 60 }
      });

      if (!response.ok) {
        throw new Error('Error querying Notion DB');
      }

      const data: any = await response.json();
      allResults = [...allResults, ...data.results];
      
      hasMore = data.has_more;
      nextCursor = data.next_cursor;
    }

    const productsMapped = await Promise.all(allResults.map(async (page: any) => {
      const props = page.properties;
      
      const DEFAULT_IMG = '/images/products/placeholder.webp';
      let rawImagesList: string[] = [];
      
      if (props.Image?.type === 'files' && props.Image.files.length > 0) {
        rawImagesList = props.Image.files.map((fileObj: any) => {
          if (fileObj.type === 'file') return fileObj.file?.url || null;
          if (fileObj.type === 'external') return fileObj.external?.url || null;
          return null;
        }).filter((url: string | null): url is string => Boolean(url && url.trim() !== ''));
      } else if (props.Image?.type === 'url' && props.Image.url) {
        rawImagesList = [props.Image.url];
      }

      // Interceptar y guardar localmente en public/uploads/ cualquier URL de Notion S3 que expire
      const processedImagesList = await Promise.all(
        rawImagesList.map((url, idx) => processAndCacheNotionUrl(url, page.id, idx))
      );

      let imageUrl = processedImagesList.length > 0 ? processedImagesList[0] : DEFAULT_IMG;
      const imagesList = processedImagesList.length > 0 ? processedImagesList : [DEFAULT_IMG];

      if (!imageUrl || imageUrl.trim() === '') {
        imageUrl = DEFAULT_IMG;
      }
      
      const name = props.Name?.title[0]?.plain_text || '';
      let options: { name: string; values: any[] }[] = [];
      const optionsJson = props.Options?.rich_text[0]?.plain_text;
      if (optionsJson) {
        try {
          options = JSON.parse(optionsJson);
        } catch (e) {
          console.error(`Error parsing Options for product ${name}:`, e);
        }
      }

      return {
        id: props.Id?.rich_text[0]?.plain_text || page.id,
        notionId: page.id,
        name: name,
        description: props.Description?.rich_text[0]?.plain_text || '',
        fullDescription: props.FullDescription?.rich_text[0]?.plain_text || '',
        price: props.Price?.number || 0,
        category: props.Category?.select?.name || '',
        image: imageUrl,
        images: imagesList,
        options: options,
        stock: props.Stock?.number ?? 10, // Default a 10 si es null (para productos antiguos)
        active: props.Active?.checkbox ?? true,
        featured: props.Destacado?.checkbox ?? false,
        isNew: props.Nuevo?.checkbox ?? false,
        tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
        inTrash: props['En Papelera']?.checkbox ?? false,
      };
    }));

    return productsMapped.filter(p => p.name && p.name !== '__CONFIG__' && (includeTrash ? true : !p.inTrash));
  } catch (error) {
    console.error('Error fetching products from Notion:', error);
    return [];
  }
}

export async function getAllOrdersFromNotion(includeTrash = false) {
  if (!ORDERS_DB_ID || !TOKEN) return [];
  try {
    let allResults: any[] = [];
    let hasMore = true;
    let nextCursor = undefined;
    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${ORDERS_DB_ID}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({ start_cursor: nextCursor }),
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Error querying Orders DB");
      const data: any = await response.json();
      allResults = [...allResults, ...data.results];
      hasMore = data.has_more;
      nextCursor = data.next_cursor;
    }
    return allResults.map(page => {
      const props = page.properties;
      return {
        id: page.id,
        orderNumber: props.OrderNumber?.rich_text[0]?.plain_text || page.id,
        name: props.Name?.title[0]?.plain_text || "",
        whatsapp: props.WhatsApp?.phone_number || "",
        city: props.City?.rich_text[0]?.plain_text || "",
        address: props.Address?.rich_text[0]?.plain_text || "",
        neighborhood: props.Neighborhood?.rich_text[0]?.plain_text || "",
        products: props.Products?.rich_text[0]?.plain_text || "",
        tones: props.Tones?.rich_text[0]?.plain_text || "",
        total: props.Total?.number || 0,
        status: props.Status?.select?.name || "Pendiente",
        date: props.Date?.date?.start || page.created_time,
        inTrash: props['En Papelera']?.checkbox ?? false,
      };
    }).filter(o => includeTrash ? true : !o.inTrash);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getStoreConfig() {
  if (!process.env.NOTION_PRODUCTS_DB || !process.env.NOTION_SECRET) return null;
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_PRODUCTS_DB}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_SECRET}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        filter: {
          property: "Name",
          title: { equals: "__CONFIG__" }
        }
      }),
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!response.ok) return null;
    const data: any = await response.json();
    if (data.results && data.results.length > 0) {
      const configStr = data.results[0].properties.FullDescription?.rich_text[0]?.plain_text;
      if (configStr) {
        return {
          id: data.results[0].id,
          ...JSON.parse(configStr)
        };
      }
    }
  } catch (error) {
    console.error("Error fetching store config:", error);
  }
  return null;
}
