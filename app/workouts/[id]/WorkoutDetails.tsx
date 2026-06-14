'use client';

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

type WorkoutResponse = {
  workout: Workout;
};

type WorkoutDetailsProps = {
  workoutId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDecimal(value: string | number | null) {
  if (value === null) {
    return '-';
  }

  return Number(value).toLocaleString('pl-PL', {
    maximumFractionDigits: 2,
  });
}

export function WorkoutDetails({ workoutId }: WorkoutDetailsProps) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkout() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = (await response.json().catch(() => null)) as WorkoutResponse | null;

        if (!response.ok) {
          setError('Nie udało się pobrać szczegółów treningu');
          return;
        }

        setWorkout(data?.workout ?? null);
      } catch {
        setError('Wystąpił błąd połączenia z serwerem');
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkout();
  }, [workoutId]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-sm text-zinc-400">
        Ładowanie szczegółów treningu...
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

  if (!workout) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-sm text-zinc-400">
        Nie znaleziono treningu.
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-500">{formatDate(workout.performedAt)}</p>
        <h2 className="mt-2 text-2xl font-bold">{workout.title}</h2>

        {workout.notes ? (
          <p className="mt-3 text-sm text-zinc-400">{workout.notes}</p>
        ) : null}
      </div>

      {workout.exercises.map((workoutExercise) => (
        <article
          key={workoutExercise.id}
          className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
        >
          <div className="border-b border-zinc-800 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {workoutExercise.exercise.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {workoutExercise.exercise.category ?? 'Bez kategorii'} ·{' '}
                  {workoutExercise.exercise.source === 'SYSTEM'
                    ? 'ćwiczenie systemowe'
                    : 'ćwiczenie własne'}
                </p>
              </div>

              <p className="text-sm text-zinc-400">
                {workoutExercise.sets.length} serii
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Seria</th>
                  <th className="px-6 py-3 font-medium">Ciężar</th>
                  <th className="px-6 py-3 font-medium">Powtórzenia</th>
                  <th className="px-6 py-3 font-medium">RPE</th>
                  <th className="px-6 py-3 font-medium">Notatka</th>
                </tr>
              </thead>

              <tbody>
                {workoutExercise.sets.map((set) => (
                  <tr key={set.id} className="border-t border-zinc-800">
                    <td className="px-6 py-4">{set.setNumber}</td>
                    <td className="px-6 py-4">{formatDecimal(set.weightKg)} kg</td>
                    <td className="px-6 py-4">{set.reps}</td>
                    <td className="px-6 py-4">{formatDecimal(set.rpe)}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {set.notes ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </section>
  );
}