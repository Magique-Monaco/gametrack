import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUser } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uuid, password } = body;

    if (!uuid || !password || typeof uuid !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'UUID and password are required' },
        { status: 400 }
      );
    }

    const user = await getUser(uuid);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid UUID or password' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid UUID or password' },
        { status: 401 }
      );
    }

    // Create session
    const token = await signToken(uuid);
    await setSessionCookie(token);

    return NextResponse.json({ uuid, createdAt: user.created_at });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to log in' },
      { status: 500 }
    );
  }
}
