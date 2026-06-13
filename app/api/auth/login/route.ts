import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { LoginSchema } from '@/lib/validations/auth';
import { sessionCookie, signSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
        {
            error: 'Invalid request body',
            details: parsed.error.flatten(),
        },
        { status: 400 },
        );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 },
        );
    }

    const passwordIsValid = await verifyPassword(password, user.passwordHash);

    if (!passwordIsValid) {
        return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 },
        );
    }

    const token = await signSessionToken(user.id);

    const response = NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    });

    response.cookies.set(sessionCookie.name, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: sessionCookie.maxAge,
    });

    return response;
}