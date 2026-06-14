import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { ExerciseSource, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const SYSTEM_SCOPE = 'system';
const DEMO_EMAIL = 'demo@liftlog.local';
const DEMO_PASSWORD = 'password123';

function normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
});

const systemExercises = [
    {
        name: 'Bench Press',
        category: 'Chest',
        notes: 'Barbell bench press',
    },
    {
        name: 'Squat',
        category: 'Legs',
        notes: 'Barbell back squat',
    },
    {
        name: 'Deadlift',
        category: 'Back',
        notes: 'Conventional barbell deadlift',
    },
    {
        name: 'Overhead Press',
        category: 'Shoulders',
        notes: 'Standing barbell overhead press',
    },
    {
        name: 'Pull-up',
        category: 'Back',
        notes: 'Bodyweight pull-up',
    },
    {
        name: 'Barbell Row',
        category: 'Back',
        notes: 'Bent-over barbell row',
    },
    {
        name: 'Dumbbell Bench Press',
        category: 'Chest',
        notes: 'Flat dumbbell bench press',
    },
    {
        name: 'Lat Pulldown',
        category: 'Back',
        notes: 'Cable lat pulldown',
    },
    {
        name: 'Leg Press',
        category: 'Legs',
        notes: 'Machine leg press',
    },
    {
        name: 'Biceps Curl',
        category: 'Arms',
        notes: 'Dumbbell or barbell curl',
    },
    {
        name: 'Triceps Pushdown',
        category: 'Arms',
        notes: 'Cable triceps pushdown',
    },
    {
        name: 'Push-up',
        category: 'Chest',
        notes: 'Bodyweight push-up',
    },
];

async function upsertSystemExercises() {
    const exercises = new Map<string, { id: string; name: string }>();

    for (const exercise of systemExercises) {
        const normalizedName = normalizeText(exercise.name);

        const savedExercise = await prisma.exercise.upsert({
        where: {
            scope_normalizedName: {
            scope: SYSTEM_SCOPE,
            normalizedName,
            },
        },
        update: {
            name: exercise.name,
            category: exercise.category,
            notes: exercise.notes,
            source: ExerciseSource.SYSTEM,
            userId: null,
        },
        create: {
            userId: null,
            scope: SYSTEM_SCOPE,
            name: exercise.name,
            normalizedName,
            category: exercise.category,
            notes: exercise.notes,
            source: ExerciseSource.SYSTEM,
        },
        select: {
            id: true,
            name: true,
        },
        });

        exercises.set(exercise.name, savedExercise);
    }

    return exercises;
}

async function createDemoUser() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    return prisma.user.upsert({
        where: {
            email: DEMO_EMAIL,
        },
        update: {
            name: 'Demo User',
            passwordHash,
        },
        create: {
            email: DEMO_EMAIL,
            name: 'Demo User',
            passwordHash,
        },
        select: {
            id: true,
            email: true,
        },
    });
}

async function createDemoWorkouts(userId: string, exercises: Map<string, { id: string; name: string }>) {
    const benchPress = exercises.get('Bench Press');
    const squat = exercises.get('Squat');
    const deadlift = exercises.get('Deadlift');
    const pullUp = exercises.get('Pull-up');
    const overheadPress = exercises.get('Overhead Press');
    const barbellRow = exercises.get('Barbell Row');

    if (!benchPress || !squat || !deadlift || !pullUp || !overheadPress || !barbellRow) {
        throw new Error('Missing required system exercises for demo workouts');
    }

    await prisma.workout.deleteMany({
        where: {
            userId,
        },
    });

    await prisma.workout.create({
        data: {
        userId,
        title: 'Push day',
        performedAt: new Date('2026-06-10T18:00:00.000Z'),
        notes: 'Pierwszy trening demo.',
        exercises: {
            create: [
            {
                orderIndex: 0,
                exercise: {
                connect: {
                    id: benchPress.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 60, reps: 10, rpe: 7 },
                    { setNumber: 2, weightKg: 70, reps: 8, rpe: 8 },
                    { setNumber: 3, weightKg: 75, reps: 6, rpe: 8.5 },
                ],
                },
            },
            {
                orderIndex: 1,
                exercise: {
                connect: {
                    id: overheadPress.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 35, reps: 10, rpe: 7 },
                    { setNumber: 2, weightKg: 40, reps: 8, rpe: 8 },
                ],
                },
            },
            ],
        },
        },
    });

    await prisma.workout.create({
        data: {
        userId,
        title: 'Pull day',
        performedAt: new Date('2026-06-11T17:30:00.000Z'),
        notes: 'Plecy i podciąganie.',
        exercises: {
            create: [
            {
                orderIndex: 0,
                exercise: {
                connect: {
                    id: pullUp.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 0, reps: 8, rpe: 8 },
                    { setNumber: 2, weightKg: 0, reps: 7, rpe: 8 },
                    { setNumber: 3, weightKg: 0, reps: 6, rpe: 8.5 },
                ],
                },
            },
            {
                orderIndex: 1,
                exercise: {
                connect: {
                    id: barbellRow.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 55, reps: 10, rpe: 7 },
                    { setNumber: 2, weightKg: 60, reps: 8, rpe: 8 },
                ],
                },
            },
            ],
        },
        },
    });

    await prisma.workout.create({
        data: {
        userId,
        title: 'Leg day',
        performedAt: new Date('2026-06-12T18:15:00.000Z'),
        notes: 'Nogi ciężej niż ostatnio.',
        exercises: {
            create: [
            {
                orderIndex: 0,
                exercise: {
                connect: {
                    id: squat.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 80, reps: 8, rpe: 7 },
                    { setNumber: 2, weightKg: 90, reps: 6, rpe: 8 },
                    { setNumber: 3, weightKg: 95, reps: 5, rpe: 8.5 },
                ],
                },
            },
            {
                orderIndex: 1,
                exercise: {
                connect: {
                    id: deadlift.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 100, reps: 5, rpe: 8 },
                    { setNumber: 2, weightKg: 110, reps: 3, rpe: 8.5 },
                ],
                },
            },
            ],
        },
        },
    });

    await prisma.workout.create({
        data: {
        userId,
        title: 'Push day',
        performedAt: new Date('2026-06-13T18:00:00.000Z'),
        notes: 'Lepsze wyciskanie niż wcześniej.',
        exercises: {
            create: [
            {
                orderIndex: 0,
                exercise: {
                connect: {
                    id: benchPress.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 65, reps: 10, rpe: 7 },
                    { setNumber: 2, weightKg: 72.5, reps: 8, rpe: 8 },
                    { setNumber: 3, weightKg: 77.5, reps: 6, rpe: 8.5 },
                ],
                },
            },
            {
                orderIndex: 1,
                exercise: {
                connect: {
                    id: overheadPress.id,
                },
                },
                sets: {
                create: [
                    { setNumber: 1, weightKg: 37.5, reps: 10, rpe: 7 },
                    { setNumber: 2, weightKg: 42.5, reps: 8, rpe: 8 },
                ],
                },
            },
            ],
        },
        },
    });
}

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set');
    }

    const exercises = await upsertSystemExercises();
    const demoUser = await createDemoUser();

    await createDemoWorkouts(demoUser.id, exercises);

    console.log('Seed completed');
    console.log(`Demo user: ${DEMO_EMAIL}`);
    console.log(`Demo password: ${DEMO_PASSWORD}`);
    console.log(`System exercises: ${exercises.size}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });