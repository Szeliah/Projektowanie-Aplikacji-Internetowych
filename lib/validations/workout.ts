import { z } from 'zod';

const SetEntrySchema = z.object({
    setNumber: z
        .number({ error: 'Numer serii musi być liczbą' })
        .int('Numer serii musi być liczbą całkowitą')
        .min(1, 'Numer serii musi być większy od 0'),

    weightKg: z
        .number({ error: 'Ciężar musi być liczbą' })
        .min(0, 'Ciężar nie może być ujemny')
        .max(1500, 'Ciężar jest zbyt duży'),

    reps: z
        .number({ error: 'Liczba powtórzeń musi być liczbą' })
        .int('Liczba powtórzeń musi być liczbą całkowitą')
        .min(1, 'Liczba powtórzeń musi być większa od 0')
        .max(400, 'Liczba powtórzeń jest zbyt duża'),

    rpe: z
        .number({ error: 'RPE musi być liczbą' })
        .min(1, 'RPE musi być w zakresie 1–10')
        .max(10, 'RPE musi być w zakresie 1–10')
        .optional()
        .nullable(),

    notes: z
        .string()
        .trim()
        .max(300, 'Notatka do serii nie może przekraczać 300 znaków')
        .optional()
        .nullable(),
});

const WorkoutExerciseSchema = z.object({
    exerciseId: z
        .string()
        .min(1, 'Wybierz ćwiczenie'),

    orderIndex: z
        .number()
        .int()
        .min(0)
        .optional(),

    sets: z
        .array(SetEntrySchema)
        .min(1, 'Ćwiczenie musi mieć co najmniej jedną serię'),
});

export const CreateWorkoutSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, 'Nazwa treningu musi mieć co najmniej 2 znaki')
        .max(100, 'Nazwa treningu nie może przekraczać 100 znaków'),

    performedAt: z
        .string()
        .datetime('Data treningu musi być w formacie ISO 8601'),

    notes: z
        .string()
        .trim()
        .max(500, 'Notatka do treningu nie może przekraczać 500 znaków')
        .optional()
        .nullable(),

    exercises: z
        .array(WorkoutExerciseSchema)
        .min(1, 'Trening musi mieć co najmniej jedno ćwiczenie'),
});

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;