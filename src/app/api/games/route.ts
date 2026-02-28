import { NextResponse } from 'next/server';
import { getIgdbToken } from '@/lib/igdbAuth';

// Keep rate limiting logic
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const accessToken = await getIgdbToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    if (!clientId) {
      throw new Error('IGDB_CLIENT_ID is missing from environment variables.');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'top';
    const limit = searchParams.get('limit') || '20';

    let queryConditions = 'sort total_rating_count desc;';
    
    switch (category) {
      case 'new':
        queryConditions = `sort first_release_date desc; where first_release_date != null & cover != null;`;
        break;
      case 'rpg':
        queryConditions = `where genres = (12); sort total_rating_count desc;`;
        break;
      case 'shooter':
        queryConditions = `where genres = (5); sort total_rating_count desc;`;
        break;
      case 'adventure':
        queryConditions = `where genres = (31); sort total_rating_count desc;`;
        break;
      case 'indie':
        queryConditions = `where genres = (32); sort total_rating_count desc;`;
        break;
      case 'trending':
        queryConditions = `sort popularity desc;`;
        break;
      case 'top':
      default:
        queryConditions = `sort total_rating_count desc;`;
        break;
    }

    // Prepare IGDB query
    const query = `
      fields name,cover.image_id,summary,url,genres.name,platforms.name,platforms.abbreviation,involved_companies.company.name,first_release_date; 
      ${queryConditions}
      limit ${limit}; 
    `;

    // Fetch from IGDB
    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain', // IGDB parses raw text bodies
      },
      body: query,
      next: { revalidate: 3600 }, // Cache the resulting request
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`IGDB API Error: ${res.status} ${errorText}`);
      throw new Error(`IGDB API responded with status: ${res.status}`);
    }

    const rawGames = await res.json();
    
    // Map IGDB response to our GameCard format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedGames = rawGames.map((g: any) => {
      // Find developer (involved_companies have a boolean for developer or publisher, but just grab the first company name for now if available)
      const developerName = g.involved_companies?.[0]?.company?.name || 'Unknown Developer';
      const developerId = g.involved_companies?.[0]?.company?.id || null;
      
      const platformsList = g.platforms ? g.platforms.map((p: {name: string, abbreviation?: string}) => p.abbreviation || p.name).join(', ') : 'Unknown';
      const genresList = g.genres ? g.genres.map((gn: {name: string}) => gn.name).join(', ') : 'Various';

      const coverUrl = g.cover?.image_id 
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
        : 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.png'; // Fallback

      return {
        id: g.id,
        title: g.name,
        thumbnail: coverUrl,
        short_description: g.summary || 'No description available.',
        game_url: g.url || `https://www.igdb.com/games/${g.id}`,
        genre: genresList.split(',')[0], // Primary genre
        platform: platformsList,
        publisher: developerName, // Simplify for demo
        developer: developerName,
        developer_id: developerId,
        release_date: g.first_release_date ? new Date(g.first_release_date * 1000).toISOString().split('T')[0] : 'TBD',
        freetogame_profile_url: g.url || '', 
      };
    });

    return NextResponse.json(formattedGames);
  } catch (error) {
    console.error('Error fetching IGDB games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games data' },
      { status: 500 }
    );
  }
}
