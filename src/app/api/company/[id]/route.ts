import { NextResponse } from 'next/server';
import { getIgdbToken } from '@/lib/igdbAuth';
import { getAgeRatingString } from '@/lib/ratings';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const companyId = resolvedParams.id;

  if (!companyId || !/^\d+$/.test(companyId)) {
    return NextResponse.json({ error: 'A valid numeric Company ID is required' }, { status: 400 });
  }

  try {
    const accessToken = await getIgdbToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    if (!clientId) {
      throw new Error('IGDB_CLIENT_ID is missing from environment variables.');
    }

    // 1. Fetch Company Info
    const companyQuery = `
      fields name,description,logo.image_id,developed.name,published.name; 
      where id = ${companyId};
    `;

    const companyRes = await fetch('https://api.igdb.com/v4/companies', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: companyQuery,
      next: { revalidate: 3600 },
    });

    if (!companyRes.ok) {
      throw new Error(`IGDB Company API Error: ${companyRes.status}`);
    }

    const rawCompanies = await companyRes.json();
    if (!rawCompanies || rawCompanies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const c = rawCompanies[0];

    // 2. Fetch Games built by this company
    const gamesQuery = `
      fields name,cover.image_id,summary,url,genres.name,platforms.name,platforms.abbreviation,involved_companies.company.name,first_release_date,total_rating,age_ratings.rating_category; 
      where involved_companies.company = ${companyId};
      sort total_rating_count desc;
      limit 48;
    `;

    const gamesRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: gamesQuery,
      next: { revalidate: 3600 },
    });

    const rawGames = gamesRes.ok ? await gamesRes.json() : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedGames = rawGames.map((g: any) => {
        const developerName = g.involved_companies?.[0]?.company?.name || c.name;
        
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
          publisher: developerName, 
          developer: developerName,
          release_date: g.first_release_date ? new Date(g.first_release_date * 1000).toISOString().split('T')[0] : 'TBD',
          freetogame_profile_url: g.url || '', 
          rating: g.total_rating ? parseFloat((g.total_rating / 10).toFixed(1)) : null,
          age_rating: getAgeRatingString(g.age_ratings),
        };
    });

    const logoUrl = c.logo?.image_id 
      ? `https://images.igdb.com/igdb/image/upload/t_logo_med/${c.logo.image_id}.png`
      : null;

    const companyData = {
        id: c.id,
        name: c.name,
        description: c.description || 'No description available.',
        logoUrl,
        games: formattedGames,
    };

    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}
