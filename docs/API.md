# MiniTube API Documentation 🔌

MiniTube is committed to building in public. We want developers to leverage our curated video feeds to build their own unique Farcaster clients, analytics dashboards, and tools. 

## Endpoints

### 1. Fetch Farcaster Video Feed
Retrieves a chronological feed of native Farcaster casts containing video media. We actively filter out invalid media, YouTube embeds, and non-playable URLs to ensure a pure short-form video experience.

- **URL:** `/api/farcaster-watch`
- **Method:** `GET`
- **Auth Required:** No (Currently Public)

#### Response Example
{
  "success": true,
  "data": [
    {
      "hash": "0x123abc...",
      "author": "real9realms",
      "text": "Check out this crazy new Web3 feature!",
      "videoUrl": "https://imagedelivery.net/.../video.mp4",
      "address": "0xabc123...",
      "aiRankScore": 45000,
      "likes": "12.4K",
      "recasts": "3.1K",
      "viewCount": "150K"
    }
  ]
}

#### Field Descriptions
- `hash`: The unique Farcaster Cast Hash. Used to identify the video on the protocol.
- `author`: The Farcaster username of the creator.
- `text`: The caption/text of the cast (we automatically strip raw URLs from this text so your UI looks clean).
- `videoUrl`: The direct `mp4` or `m3u8` video source.
- `address`: The verified custody address of the creator. **CRITICAL:** Use this address to route any tips/payments natively to the creator.

## 2. Fetch YouTube Proxy Feed
Retrieves videos from the global YouTube API, allowing for a hybrid Web2/Web3 video index. Automatically falls back to a scraper if the Official API quota is exceeded.

- **URL:** `/api/videos?q=query&type=video`
- **Method:** `GET`
- **Auth Required:** No

## Caching & Rate Limits
Our endpoints are incredibly fast and scalable. 
- `/api/farcaster-watch` utilizes **Vercel KV (Redis) Edge Caching** with a 15-minute TTL to prevent Neynar API exhaustion and deliver `<50ms` video feeds to users globally.
- `/api/videos` uses Next.js Incremental Static Regeneration (ISR) and `fetch` revalidation caching at the edge.
