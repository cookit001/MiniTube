import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Explicitly use the custom minitube_KV variables
const kv = new Redis({
  url: process.env.minitube_KV_REST_API_URL || '',
  token: process.env.minitube_KV_REST_API_TOKEN || '',
});

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (!hash) {
      return NextResponse.json({ success: false, error: 'Missing hash' }, { status: 400 });
    }

    if (!process.env.minitube_KV_REST_API_URL) {
      return NextResponse.json({ success: true, message: 'Simulated KV increment', hash });
    }


    // Increment the view counter in high-speed Redis
    const key = `video_views:${hash}`;
    const newCount = await kv.incr(key);
    
    // Set to expire after 1 year (31536000 seconds)
    await kv.expire(key, 31536000);

    return NextResponse.json({ success: true, views: newCount });
  } catch (error) {
    console.error('Views API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to increment view' }, { status: 500 });
  }
}
