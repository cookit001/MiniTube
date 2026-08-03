import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis directly
const kv = new Redis({
  url: process.env.minitube_KV_REST_API_URL || '',
  token: process.env.minitube_KV_REST_API_TOKEN || '',
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.minitube_KV_REST_API_URL) {
      // Fallback for local dev without KV configured
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch live global notifications from Redis
    const data = await kv.get<any[]>('minitube_live_notifications_feed');
    
    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    }, {
      headers: {
        'Cache-Control': 's-maxage=10, stale-while-revalidate=30', // Very short cache for live feel
      },
    });
  } catch (error) {
    console.error('Failed to fetch live notifications:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
