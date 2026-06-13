import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { RegisterSchema } from '@/lib/validations/auth';
import { sessionCookie, signSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: 'Invalid request body',
                details: parsed.error.flatten(),
            },
            { status: 400 },
        );
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingUser) {
        return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 },
        );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name: name || null,
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });

    const token = await signSessionToken(user.id);

    const response = NextResponse.json({ user }, { status: 201 });

    response.cookies.set(sessionCookie.name, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: sessionCookie.maxAge,
    });

    return response;
}