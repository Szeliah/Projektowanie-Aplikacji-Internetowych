import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Podaj poprawny adres e-mail'),

    password: z
        .string()
        .min(8, 'Hasło musi mieć co najmniej 8 znaków')
        .max(100, 'Hasło jest zbyt długie'),

    name: z
        .string()
        .trim()
        .min(2, 'Imię musi mieć co najmniej 2 znaki')
        .max(30, 'Imię jest zbyt długie')
        .optional()
        .or(z.literal('')),
});

export const LoginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Podaj poprawny adres e-mail'),

    password: z
        .string()
        .min(1, 'Podaj hasło'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;