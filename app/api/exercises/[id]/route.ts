import { ExerciseSource, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { normalizeText } from '@/lib/text';
import { UpdateExerciseSchema } from '@/lib/validations/exercise';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const exercise = await prisma.exercise.findFirst({
        where: {
        id,
        OR: [
            { source: ExerciseSource.SYSTEM },
            { userId },
        ],
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

    if (!exercise) {
        return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json({ exercise });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await request.json().catch(() => null);
    const parsed = UpdateExerciseSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
        {
            error: 'Invalid request body',
            details: parsed.error.flatten(),
        },
        { status: 400 },
        );
    }

    const existingExercise = await prisma.exercise.findFirst({
        where: {
            id,
            userId,
            source: ExerciseSource.CUSTOM,
        },
            select: { id: true },
    });

    if (!existingExercise) {
        return NextResponse.json(
            { error: 'Custom exercise not found or cannot be edited' },
            { status: 404 },
        );
    }

    const { name, category, notes } = parsed.data;

    try {
        const exercise = await prisma.exercise.update({
        where: { id },
        data: {
            ...(name !== undefined ? { name, normalizedName: normalizeText(name) } : {}),
            ...(category !== undefined ? { category: category || null } : {}),
            ...(notes !== undefined ? { notes: notes || null } : {}),
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

        return NextResponse.json({ exercise });

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

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const existingExercise = await prisma.exercise.findFirst({
        where: {
            id,
            userId,
            source: ExerciseSource.CUSTOM,
        },
            select: { id: true },
    });

    if (!existingExercise) {
        return NextResponse.json(
            { error: 'Custom exercise not found or cannot be deleted' },
            { status: 404 },
        );
    }

    try {
        await prisma.exercise.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return NextResponse.json(
            {
                error: 'Exercise is already used in workouts and cannot be deleted safely',
            },
            { status: 409 },
        );
        }

        throw error;
    }
}