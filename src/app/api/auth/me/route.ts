import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getUser } from '@/lib/db';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        uuid: user.id,
        createdAt: user.created_at,
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
