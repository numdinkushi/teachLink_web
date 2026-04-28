import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/ratelimit';
import { validateBody } from '@/lib/validation';
import { SignupRequestSchema } from '@/types/api/auth.dto';
import type { AuthResponseDTO, AuthErrorDTO } from '@/types/api/auth.dto';

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------


export async function POST(
  request: NextRequest,
): Promise<NextResponse<AuthResponseDTO | AuthErrorDTO>> {
  const { addHeaders, rateLimitResponse } = withRateLimit(request, 'AUTH');
  if (rateLimitResponse) return rateLimitResponse as NextResponse;

export async function POST(request: NextRequest) {
  const { addHeaders, rateLimitResponse } = withRateLimit(request, 'AUTH');
  if (rateLimitResponse) {
    return rateLimitResponse as NextResponse<AuthResponse | { message: string }>;
  }

  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;


  const result = validateBody(SignupRequestSchema, await request.json());
  if (!result.ok) return addHeaders(result.error) as NextResponse;

  const { name, email } = result.data;


  // Mock: block already-registered email
  if (email === 'existing@teachlink.com') {
    return addHeaders(NextResponse.json({ message: 'Email already registered' }, { status: 409 }));
  }

    if (password.length < 6) {
      return addHeaders(
        NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 }),
      );
    }

    if (email === 'existing@teachlink.com') {
      return addHeaders(
        NextResponse.json({ message: 'Email already registered' }, { status: 409 }),
      );
    }


  return addHeaders(
    NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: Math.random().toString(36).substring(2, 9),
          name,
          email,
        },
        token: `mock-jwt-token-${Date.now()}`,
      },
      { status: 201 },
    ),
  );
}
