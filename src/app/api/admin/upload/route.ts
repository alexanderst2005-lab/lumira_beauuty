import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { file, filename } = await request.json(); // file = base64 string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extraer base64 si viene con prefijo data:image/png;base64,...
    const matches = file.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let extension = 'jpg';
    let base64Content = file;

    if (matches && matches.length === 3) {
      extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Content = matches[2];
    } else if (file.includes('base64,')) {
      base64Content = file.split('base64,')[1];
    }

    // Intentar guardar localmente en public/uploads/
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanFileName = (filename || 'img').replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const filePath = path.join(uploadsDir, uniqueName);

      const buffer = Buffer.from(base64Content, 'base64');
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${uniqueName}`;
      return NextResponse.json({ success: true, url: localUrl });
    } catch (fsError) {
      console.warn('Error al guardar localmente en fs, intentando fallback a servidor de imágenes:', fsError);
      
      // Fallback a freeimage.host si el sistema de archivos no es escribible (ej. serverless sin disco)
      const formData = new FormData();
      formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
      formData.append('action', 'upload');
      formData.append('source', base64Content);
      formData.append('format', 'json');

      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen al servidor remoto');
      }

      const data = await response.json();
      if (data.status_code !== 200) {
        throw new Error(data.error?.message || 'Error al subir la imagen');
      }

      return NextResponse.json({ success: true, url: data.image.url });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

