import { getIgdbToken } from './src/lib/igdbAuth';

async function test() {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;
  
  const query = `
      fields name,cover.image_id,summary,url,genres.name,platforms.name,platforms.abbreviation,involved_companies.company.name,first_release_date; 
      sort popularity desc; 
      limit 5;
    `;
  
  const queryRPG = `
      fields name,cover.image_id,summary,url,genres.name,platforms.name,platforms.abbreviation,involved_companies.company.name,first_release_date; 
      sort total_rating_count desc; 
      where genres = (12);
      limit 5;
    `;

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': clientId as string,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'text/plain',
    },
    body: query,
  });

  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

test();
