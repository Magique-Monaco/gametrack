import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { upsertGame, deleteGame } from '@/lib/db';

// PUT /api/library/[gameId] — update a single game in the user's library
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;
    const gameIdNum = parseInt(gameId, 10);
    if (isNaN(gameIdNum)) {
      return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, thumbnail, status, playtime, added_at } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await upsertGame(userId, {
      game_id: gameIdNum,
      title,
      thumbnail: thumbnail || '',
      status: status || 'Plan to Play',
      playtime: playtime || 0,
      added_at: added_at || Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Library update error:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

// DELETE /api/library/[gameId] — remove a game from the user's library
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;
    const gameIdNum = parseInt(gameId, 10);
    if (isNaN(gameIdNum)) {
      return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
    }

    await deleteGame(userId, gameIdNum);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Library delete error:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
