import { NextResponse } from 'next/server';
import { getIgdbToken } from '@/lib/igdbAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const gameId = resolvedParams.id;

  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
  }

  try {
    const accessToken = await getIgdbToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    if (!clientId) {
      throw new Error('IGDB_CLIENT_ID is missing from environment variables.');
    }

    const query = `
      fields name,cover.image_id,summary,storyline,url,genres.name,platforms.name,platforms.abbreviation,
      involved_companies.company.name,involved_companies.developer,involved_companies.publisher,
      first_release_date,screenshots.image_id,similar_games.name,similar_games.cover.image_id,websites.category,websites.url; 
      where id = ${gameId};
    `;

    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
      },
      body: query,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`IGDB API Error: ${res.status} ${errorText}`);
      throw new Error(`IGDB API responded with status: ${res.status}`);
    }

    const rawGames = await res.json();
    
    if (!rawGames || rawGames.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = rawGames[0];
    
    // Format full details
    const coverUrl = g.cover?.image_id 
      ? `https://images.igdb.com/igdb/image/upload/t_1080p/${g.cover.image_id}.jpg`
      : 'https://images.igdb.com/igdb/image/upload/t_1080p/nocover.png';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const screenshotUrls = g.screenshots ? g.screenshots.map((s: any) => `https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`) : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const developers = g.involved_companies?.filter((c: any) => c.developer) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publishers = g.involved_companies?.filter((c: any) => c.publisher) || [];

    const formattedGame = {
      id: g.id,
      title: g.name,
      thumbnail: coverUrl,
      // Fallbacks
      short_description: g.summary || 'No description available.',
      description: g.storyline || g.summary || 'No description available.',
      game_url: g.url || `https://www.igdb.com/games/${g.id}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genre: g.genres ? g.genres.map((gn: any) => gn.name).join(', ') : 'Various',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platform: g.platforms ? g.platforms.map((p: any) => p.abbreviation || p.name).join(', ') : 'Unknown',
      // Provide array of exact platform strings for the icon mapper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      platform_list: g.platforms ? g.platforms.map((p: any) => p.name) : [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publisher: publishers.length > 0 ? publishers.map((c: any) => c.company.name).join(', ') : 'Unknown Publisher',
      publisher_id: publishers.length > 0 ? publishers[0].company.id : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      developer: developers.length > 0 ? developers.map((c: any) => c.company.name).join(', ') : 'Unknown Developer',
      developer_id: developers.length > 0 ? developers[0].company.id : undefined,
      release_date: g.first_release_date ? new Date(g.first_release_date * 1000).toISOString().split('T')[0] : 'TBD',
      screenshots: screenshotUrls,
      websites: g.websites || [],
    };

    return NextResponse.json(formattedGame);
  } catch (error) {
    console.error('Error fetching game details from IGDB:', error);
    return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
  }
}
