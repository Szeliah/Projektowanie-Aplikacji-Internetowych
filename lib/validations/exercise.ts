import { z } from 'zod';

export const CreateExerciseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nazwa ćwiczenia musi mieć co najmniej 2 znaki')
    .max(80, 'Nazwa ćwiczenia nie może przekraczać 80 znaków'),

  category: z
    .string()
    .trim()
    .max(80, 'Kategoria nie może przekraczać 80 znaków')
    .optional()
    .nullable(),

  notes: z
    .string()
    .trim()
    .max(200, 'Notatka nie może przekraczać 200 znaków')
    .optional()
    .nullable(),
});

export const UpdateExerciseSchema = CreateExerciseSchema.partial();

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>;