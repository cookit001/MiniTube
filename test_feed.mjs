import fetch from 'node-fetch';
import fs from 'fs';

async function run() {
  const apiKey = 'E768F127-61AF-47F2-85B3-624477746243'; 
  let allCasts = [];
  let cursor = '';
  
  for(let i=0; i<3; i++) {
    const url = `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=embed_types&embed_types=video&limit=100${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await fetch(url, { headers: { accept: 'application/json', api_key: apiKey } });
    const data = await res.json();
    if(data.casts) allCasts.push(...data.casts);
    if(data.next?.cursor) cursor = data.next.cursor;
    else break;
  }
  
  let passed = [];
  
  for(const cast of allCasts) {
    if(!cast.embeds || !cast.embeds.length) continue;
    const firstEmbed = cast.embeds[0];
    const url = firstEmbed.url;
    if(!url) continue;
    
    let isVideoUrl = false;
    
    // Original validation
    if (url.toLowerCase().match(/\.(mp4|webm|ogg|m3u8)$/)) {
        isVideoUrl = true;
    } else if (url.includes('imagedelivery.net')) {
        isVideoUrl = true; 
    } else if (url.includes('cloudflarestream.com')) {
        isVideoUrl = true;
    } else if (url.includes('warpcast.com') && url.includes('/video/')) {
        isVideoUrl = true;
    } else if (url.includes('arweave.net')) {
        isVideoUrl = true;
    }
    
    if(!isVideoUrl) continue;
    
    // Filter
    if (url.includes('twimg.com') || 
        url.includes('tweet_video') || 
        url.includes('dynamic-static-assets') || 
        url.includes('google.com') || 
        url.includes('googleusercontent')) {
        continue;
    }
    
    passed.push(url);
  }
  
  console.log(`Total casts: ${allCasts.length}`);
  console.log(`Passed filter: ${passed.length}`);
  fs.writeFileSync('passed_urls.json', JSON.stringify(passed, null, 2));
}

run();
