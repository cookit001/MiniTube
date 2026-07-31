import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Construct the viral Farcaster Frame markup
  const host = process.env.NEXT_PUBLIC_HOST || 'https://minitube.app';
  const imageUrl = `${host}/og-image.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="MiniTube" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="Watch on MiniTube 📺" />
        <meta property="fc:frame:button:1:action" content="post_redirect" />
        <meta property="fc:frame:post_url" content="${host}/api/frame/redirect" />
      </head>
      <body>
        <h1>MiniTube Farcaster Frame Active</h1>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
