import Link from 'next/link';
import { ExerciseSource } from '@prisma/client';
import { redirect } from 'next/navigation';

import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';

import { LogoutButton } from '@/components/LogoutButton';

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect('/login');
  }

  const [user, workoutCount, availableExerciseCount, latestWorkouts] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
        name: true,
      },
    }),
    prisma.workout.count({
      where: {
        userId,
      },
    }),
    prisma.exercise.count({
      where: {
        OR: [
          { source: ExerciseSource.SYSTEM },
          { userId },
        ],
      },
    }),
    prisma.workout.findMany({
      where: {
        userId,
      },
      orderBy: {
        performedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        performedAt: true,
        exercises: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">LiftLog</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Zalogowano jako {user?.name ?? user?.email}
            </p>
          </div>

            <div className="flex flex-wrap items-center gap-3">
                <Link
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
                    href="/exercises"
                >
                    Ćwiczenia
                </Link>

                <Link
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                    href="/workouts"
                >
                    Treningi
                </Link>

                <LogoutButton />
            </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Treningi</p>
            <p className="mt-3 text-3xl font-bold">{workoutCount}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Dostępne ćwiczenia</p>
            <p className="mt-3 text-3xl font-bold">{availableExerciseCount}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Status</p>
            <p className="mt-3 text-3xl font-bold text-emerald-400">Aktywny</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ostatnie treningi</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Dane pochodzą z bazy PostgreSQL przez Prisma.
              </p>
            </div>
          </div>

          {latestWorkouts.length > 0 ? (
            <div className="space-y-3">
              {latestWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4"
                >
                  <div>
                    <p className="font-medium">{workout.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {new Intl.DateTimeFormat('pl-PL', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(workout.performedAt)}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-400">
                    {workout.exercises.length} ćw.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-400">
              Brak treningów. Dodamy je w kolejnym widoku.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}