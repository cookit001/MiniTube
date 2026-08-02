import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
const kv = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (!hash) {
      return NextResponse.json({ success: false, error: 'Missing hash' }, { status: 400 });
    }

    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ success: true, message: 'Simulated KV increment', hash });
    }

    // Increment the view counter in high-speed Redis
    const newCount = await kv.incr(`video_views:${hash}`);

    return NextResponse.json({ success: true, views: newCount });
  } catch (error) {
    console.error('Views API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to increment view' }, { status: 500 });
  }
}
