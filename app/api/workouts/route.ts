import { ExerciseSource } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreateWorkoutSchema } from '@/lib/validations/workout';

export async function GET() {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
        where: { userId },
        orderBy: { performedAt: 'desc' },
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

    return NextResponse.json({ workouts });
}

export async function POST(request: NextRequest) {
    const userId = await getCurrentUserId();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = CreateWorkoutSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
        {
            error: 'Invalid request body',
            details: parsed.error.flatten(),
        },
        { status: 400 },
        );
    }

    const { title, performedAt, notes, exercises } = parsed.data;

    const exerciseIds = [...new Set(exercises.map((exercise) => exercise.exerciseId))];

    const availableExercises = await prisma.exercise.findMany({
        where: {
        id: { in: exerciseIds },
        OR: [
            { source: ExerciseSource.SYSTEM },
            { userId },
        ],
        },
        select: { id: true },
    });

    const availableExerciseIds = new Set(
        availableExercises.map((exercise) => exercise.id),
    );

    const invalidExerciseIds = exerciseIds.filter(
        (exerciseId) => !availableExerciseIds.has(exerciseId),
    );

    if (invalidExerciseIds.length > 0) {
        return NextResponse.json(
        {
            error: 'Some exercises do not exist or are not available for this user',
            invalidExerciseIds,
        },
        { status: 400 },
        );
    }

    const workout = await prisma.workout.create({
        data: {
        userId,
        title,
        performedAt: new Date(performedAt),
        notes: notes || null,
        exercises: {
            create: exercises.map((workoutExercise, exerciseIndex) => ({
            orderIndex: workoutExercise.orderIndex ?? exerciseIndex,
            exercise: {
                connect: {
                id: workoutExercise.exerciseId,
                },
            },
            sets: {
                create: workoutExercise.sets.map((set, setIndex) => ({
                setNumber: set.setNumber ?? setIndex + 1,
                weightKg: set.weightKg,
                reps: set.reps,
                rpe: set.rpe ?? null,
                notes: set.notes || null,
                })),
            },
            })),
        },
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

    return NextResponse.json({ workout }, { status: 201 });
}