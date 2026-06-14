'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type WorkoutSet = {
  id: string;
  setNumber: number;
  weightKg: string | number | null;
  reps: number;
  rpe: string | number | null;
  notes: string | null;
};

type WorkoutExercise = {
  id: string;
  orderIndex: number;
  exercise: {
    id: string;
    name: string;
    category: string | null;
    source: 'SYSTEM' | 'CUSTOM';
  };
  sets: WorkoutSet[];
};

type Workout = {
  id: string;
  title: string;
  performedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutExercise[];
};

type WorkoutsResponse = {
  workouts: Workout[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function WorkoutsList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/workouts', {
          method: 'GET',
          credentials: 'include',
        });

        const data = (await response.json().catch(() => null)) as WorkoutsResponse | null;

        if (!response.ok) {
          setError('Nie udało się pobrać treningów');
          return;
        }

        setWorkouts(data?.workouts ?? []);
      } catch {
        setError('Wystąpił błąd połączenia z serwerem');
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkouts();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-sm text-zinc-400">
        Ładowanie treningów...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-900 bg-red-950/40 p-8 text-sm text-red-200">
        {error}
      </section>
    );
  }

  if (workouts.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">
        <h2 className="text-xl font-semibold">Brak treningów</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Po dodaniu treningów pojawią się tutaj.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {workouts.map((workout) => {
        const setsCount = workout.exercises.reduce(
          (sum, exercise) => sum + exercise.sets.length,
          0,
        );

        return (
          <Link
            key={workout.id}
            className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-emerald-500/70 hover:bg-zinc-900/80"
            href={`/workouts/${workout.id}`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-500">{formatDate(workout.performedAt)}</p>
                <h2 className="mt-2 text-xl font-semibold">{workout.title}</h2>

                {workout.notes ? (
                  <p className="mt-2 text-sm text-zinc-400">{workout.notes}</p>
                ) : null}
              </div>

              <div className="flex gap-3 text-sm">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center">
                  <p className="text-lg font-bold">{workout.exercises.length}</p>
                  <p className="text-zinc-500">ćwiczeń</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center">
                  <p className="text-lg font-bold">{setsCount}</p>
                  <p className="text-zinc-500">serii</p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}