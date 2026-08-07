import { NextResponse } from 'next/server';
import { getStoreConfig } from '@/data/notion';

export async function PATCH(request: Request) {
  try {
    const configData = await request.json();
    const currentConfig = await getStoreConfig();
    
    if (!currentConfig || !currentConfig.id) {
      return NextResponse.json({ error: 'Config not found in Notion' }, { status: 404 });
    }

    const { id, ...rest } = currentConfig;
    const mergedConfig = { ...rest, ...configData };

    const token = process.env.NOTION_SECRET;
    
    const response = await fetch(`https://api.notion.com/v1/pages/${currentConfig.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        properties: {
          FullDescription: {
            rich_text: [
              {
                text: {
                  content: JSON.stringify(mergedConfig)
                }
              }
            ]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API error updating config:', errorData);
      return NextResponse.json({ error: 'Failed to update config in Notion' }, { status: response.status });
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, config: mergedConfig });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
