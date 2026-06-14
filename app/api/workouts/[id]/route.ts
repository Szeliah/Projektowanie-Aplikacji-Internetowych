import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const workout = await prisma.workout.findFirst({
        where: {
            id,
            userId,
        },
        select: {
            id: true,
            title: true,
            performedAt: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            exercises: {
                orderBy: { orderIndex: 'asc' },
                select: {
                    id: true,
                    orderIndex: true,
                    exercise: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            source: true,
                        },
                    },
                    sets: {
                        orderBy: { setNumber: 'asc' },
                        select: {
                            id: true,
                            setNumber: true,
                            weightKg: true,
                            reps: true,
                            rpe: true,
                            notes: true,
                        },
                    },
                },
            },
        },
    });

    if (!workout) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    return NextResponse.json({ workout });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const existingWorkout = await prisma.workout.findFirst({
        where: {
            id,
            userId,
        },
        select: { id: true },
    });

    if (!existingWorkout) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    await prisma.workout.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}