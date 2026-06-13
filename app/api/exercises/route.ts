import { ExerciseSource, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { normalizeText } from '@/lib/text';
import { CreateExerciseSchema } from '@/lib/validations/exercise';

export async function GET(request: NextRequest) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get('search');
    const normalizedSearch = search ? normalizeText(search) : null;

    const exercises = await prisma.exercise.findMany({
        where: {
        AND: [
            {
            OR: [
                { source: ExerciseSource.SYSTEM },
                { userId },
            ],
            },
            normalizedSearch
            ? {
                normalizedName: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                },
                }
            : {},
        ],
        },
        orderBy: [
            { source: 'asc' },
            { name: 'asc' },
        ],
        select: {
            id: true,
            name: true,
            normalizedName: true,
            category: true,
            notes: true,
            source: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json({ exercises });
}

export async function POST(request: NextRequest) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = CreateExerciseSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
        {
            error: 'Invalid request body',
            details: parsed.error.flatten(),
        },
        { status: 400 },
        );
    }

    const { name, category, notes } = parsed.data;
    const normalizedName = normalizeText(name);

    try {
        const exercise = await prisma.exercise.create({
        data: {
            userId,
            scope: userId,
            name,
            normalizedName,
            category: category || null,
            notes: notes || null,
            source: ExerciseSource.CUSTOM,
        },
        select: {
            id: true,
            name: true,
            normalizedName: true,
            category: true,
            notes: true,
            source: true,
            createdAt: true,
            updatedAt: true,
        },
        });

        return NextResponse.json({ exercise }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Custom exercise with this name already exists' },
                { status: 409 },
            );
        }

        throw error;
    }
}