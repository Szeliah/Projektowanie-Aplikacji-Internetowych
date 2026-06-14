import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/LogoutButton';
import { getCurrentUserId } from '@/lib/auth';

import { ExercisesClient } from './ExercisesClient';

export default async function ExercisesPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">LiftLog</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Ćwiczenia
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Katalog ćwiczeń systemowych i własnych użytkownika.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
              href="/dashboard"
            >
              Dashboard
            </Link>

            <Link
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
              href="/workouts"
            >
              Treningi
            </Link>

            <LogoutButton />
          </div>
        </header>

        <ExercisesClient />
      </div>
    </main>
  );
}