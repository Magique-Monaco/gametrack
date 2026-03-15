import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getUserLibrary, syncFullLibrary } from '@/lib/db';

// GET /api/library — fetch user's saved games from DB
export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const games = await getUserLibrary(userId);
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}

// POST /api/library — save/sync full library to DB (bulk upsert)
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { games } = body;

    if (!Array.isArray(games)) {
      return NextResponse.json({ error: 'Games array is required' }, { status: 400 });
    }

    // Validate each game entry
    for (const game of games) {
      if (!game.game_id || !game.title) {
        return NextResponse.json(
          { error: 'Each game must have game_id and title' },
          { status: 400 }
        );
      }
    }

    await syncFullLibrary(userId, games);

    return NextResponse.json({ success: true, count: games.length });
  } catch (error) {
    console.error('Library sync error:', error);
    return NextResponse.json({ error: 'Failed to sync library' }, { status: 500 });
  }
}
