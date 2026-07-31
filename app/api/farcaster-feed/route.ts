import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logAuditEvent } from '@/app/utils/security';

const FarcasterFeedSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  fid: z.coerce.number().optional(), // Optional filter by specific Farcaster ID
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = FarcasterFeedSchema.safeParse(Object.fromEntries(searchParams));

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: validation.error.format() }, { status: 400 });
    }

    const { limit, fid } = validation.data;
    
    // We utilize a standard Neynar or Hub API endpoint
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) throw new Error('Missing Farcaster Hub API Key');

    const hubUrl = fid 
      ? `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=${limit}`
      : `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=global_trending&limit=${limit}`;

    const res = await fetch(hubUrl, {
      headers: { 
        'api_key': apiKey,
        'Accept': 'application/json' 
      },
      next: { revalidate: 60 } // Cache trending feeds for 60 seconds
    });

    if (!res.ok) throw new Error(`Farcaster Hub Error: ${res.status}`);

    const data = await res.json();
    
    // Strictly filter out non-video content to prevent hosting/rendering unsupported media
    const videoCasts = data.casts.filter((cast: any) => 
      cast.embeds?.some((embed: any) => embed.url && (embed.url.includes('.mp4') || embed.url.includes('youtube.com') || embed.url.includes('youtu.be')))
    ).map((cast: any) => ({
      hash: cast.hash,
      author: cast.author.username,
      text: cast.text,
      videoUrls: cast.embeds.filter((e: any) => e.url).map((e: any) => e.url),
      timestamp: cast.timestamp
    }));

    await logAuditEvent('FARCASTER_FEED_FETCH', 'system', { limit, fetchedCount: videoCasts.length });

    return NextResponse.json({ success: true, data: videoCasts });
  } catch (error: any) {
    await logAuditEvent('FARCASTER_FEED_ERROR', 'system', { message: error.message });
    return NextResponse.json({ success: false, error: 'Failed to fetch Farcaster feed.' }, { status: 500 });
  }
}
