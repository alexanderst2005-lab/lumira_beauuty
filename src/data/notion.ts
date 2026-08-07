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
        next: { revalidate: 3600 }
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
      
      let imageUrl = '/images/products/placeholder.webp';
      let imagesList: string[] = [];
      
      if (props.Image?.type === 'files' && props.Image.files.length > 0) {
        imagesList = props.Image.files.map((fileObj: any) => {
          if (fileObj.type === 'file') return fileObj.file.url;
          if (fileObj.type === 'external') return fileObj.external.url;
          return null;
        }).filter((url: string | null) => url !== null);
        
        if (imagesList.length > 0) {
          imageUrl = imagesList[0];
        }
      } else if (props.Image?.type === 'url' && props.Image.url) {
        imageUrl = props.Image.url;
        imagesList = [imageUrl];
      }
      
      const name = props.Name?.title[0]?.plain_text || '';
      let tones: {name: string, hex: string}[] = [];
      
      if (name === 'Splash Purpure 200ml' || name.includes('Splash Purpure')) {
        tones = [
          { name: 'Caramel Crush', hex: '#FDB777' },
          { name: 'Bubble Gum', hex: '#72D6D3' },
          { name: 'Piña Colada', hex: '#F9E58A' },
          { name: 'Strawberry', hex: '#F381A6' },
          { name: 'Choco Vibes', hex: '#5E3823' }
        ];
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
        images: imagesList.length > 0 ? imagesList : [imageUrl],
        tones: tones,
        stock: props.Stock?.number ?? 10, // Default a 10 si es null (para productos antiguos)
        active: props.Active?.checkbox ?? true,
        featured: props.Destacado?.checkbox ?? false,
        isNew: props.Nuevo?.checkbox ?? false,
        tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
      };
    }).filter(p => p.name && p.name.trim() !== '' && p.price > 0);
  } catch (error) {
    console.error('Error fetching products from Notion:', error);
    return [];
  }
}

export async function getAllOrdersFromNotion() {
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
      };
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}
