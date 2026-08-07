import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { file, filename } = await request.json(); // file = base64 string
    
    // Extraer base64 si viene con prefijo data:image/png;base64,...
    const base64Content = file.includes('base64,') ? file.split('base64,')[1] : file;

    const formData = new FormData();
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5'); // freeimage.host public API key
    formData.append('action', 'upload');
    formData.append('source', base64Content);
    formData.append('format', 'json');

    const response = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al subir la imagen al servidor');
    }

    const data = await response.json();
    
    if (data.status_code !== 200) {
      throw new Error(data.error?.message || 'Error desconocido al subir imagen');
    }

    const imageUrl = data.image.url;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
