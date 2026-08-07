import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { file, filename } = await request.json(); // file = base64 string
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: 'GITHUB_TOKEN no configurado en el servidor' }, { status: 500 });
    }

    const repoOwner = 'alexanderst2005-lab';
    const repoName = 'lumira_beauuty';
    const path = `public/images/products/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Extraer base64 si viene con prefijo data:image/png;base64,...
    const base64Content = file.split(',')[1] || file;

    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `Upload product image: ${filename}`,
        content: base64Content
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error uploading to GitHub');
    }

    // La URL cruda (raw) que usa Next.js Image Optimization
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${path}`;

    return NextResponse.json({ success: true, url: rawUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
