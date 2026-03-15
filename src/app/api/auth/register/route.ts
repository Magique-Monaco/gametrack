import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { createUser } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be at most 128 characters' },
        { status: 400 }
      );
    }

    // Generate UUID as the user's username
    const uuid = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);

    await createUser(uuid, passwordHash);

    // Create session
    const token = await signToken(uuid);
    await setSessionCookie(token);

    return NextResponse.json({ uuid }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
