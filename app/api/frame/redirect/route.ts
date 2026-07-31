import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const host = process.env.NEXT_PUBLIC_HOST || 'https://minitube.app';
  // Redirect the user from the Warpcast Frame directly into the MiniTube Watch Feed
  return NextResponse.redirect(`${host}/farcaster-watch`, { status: 302 });
}
