import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    // Graceful fallback to client-side local notification engine
    return NextResponse.json({ success: true, data: [] });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey || apiKey === 'your_neynar_api_key_here') {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    // If we have an FID, we can use Neynar API to check recent interactions.
    // Note: True notification endpoint in Neynar requires Signer UUID, 
    // but we can query the user's recent casts and check for engagement as a fallback.
    // For this prototype, we will return some simulated Farcaster engagement to demonstrate the UI.
    
    // In production, this would make a request to:
    // https://api.neynar.com/v2/farcaster/notifications?fid=...
    
    // Simulate real-time API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulated Farcaster Notifications
    const mockNotifications = [
      {
        id: Math.random().toString(36).substring(7),
        type: 'like',
        actor: 'dwr.eth',
        message: '@dwr.eth liked your cast',
        timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
        read: false
      },
      {
        id: Math.random().toString(36).substring(7),
        type: 'reply',
        actor: 'v',
        message: '@v replied: "This is exactly what web3 needs! 🚀"',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        read: false
      }
    ];

    return NextResponse.json({ success: true, data: mockNotifications });
  } catch (error) {
    console.error('Neynar notification fetch exception:', error);
    return NextResponse.json({ success: false, error: 'API Failure' }, { status: 500 });
  }
}
