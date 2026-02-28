import fs from 'fs';
import path from 'path';

const TOKEN_FILE_PATH = path.join(process.cwd(), '.igdb-token.json');

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface StoredToken {
  access_token: string;
  expires_at: number; // Unix timestamp in milliseconds
}

/**
 * Fetches a new access token from Twitch OAuth.
 */
async function fetchNewToken(): Promise<StoredToken> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET is missing from environment variables.');
  }

  const tokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Twitch token: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: TwitchTokenResponse = await response.json();
  
  // Calculate expiration time, subtracting a 5-minute buffer safely
  const bufferMs = 5 * 60 * 1000;
  const expires_at = Date.now() + (data.expires_in * 1000) - bufferMs;

  const storedToken: StoredToken = {
    access_token: data.access_token,
    expires_at,
  };

  // Save to local JSON file
  try {
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(storedToken, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write IGDB token to file:', err);
  }

  return storedToken;
}

/**
 * Retrieves a valid IGDB Access Token. Returns the cached token from local file if valid,
 * otherwise requests a new one and caches it.
 */
export async function getIgdbToken(): Promise<string> {
  try {
    // Check if token file exists
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const fileContent = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
      const storedToken: StoredToken = JSON.parse(fileContent);

      // If token is still valid (not expired)
      if (Date.now() < storedToken.expires_at) {
        return storedToken.access_token;
      }
    }
  } catch (err) {
    console.error('Error reading local IGDB token:', err);
    // Ignore error and fallthrough to fetch a new token
  }

  // Token is missing, expired, or failed to parse. Fetch a new one.
  console.log('Fetching new IGDB Access Token...');
  const newToken = await fetchNewToken();
  return newToken.access_token;
}
