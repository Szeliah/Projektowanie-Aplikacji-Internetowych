'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Exercise = {
  id: string;
  name: string;
  normalizedName: string;
  category: string | null;
  notes: string | null;
  source: 'SYSTEM' | 'CUSTOM';
  createdAt: string;
  updatedAt: string;
};

type ExercisesResponse = {
  exercises: Exercise[];
};

export function ExercisesClient() {
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadExercises = useCallback(async (searchValue: string) => {
    setIsLoading(true);
    setListError(null);

    const params = new URLSearchParams();

    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }

    const url = params.toString()
      ? `/api/exercises?${params.toString()}`
      : '/api/exercises';

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const data = (await response.json().catch(() => null)) as ExercisesResponse | null;

      if (!response.ok) {
        setListError('Nie udało się pobrać ćwiczeń');
        return;
      }

      setExercises(data?.exercises ?? []);
    } catch {
      setListError('Wystąpił błąd połączenia z serwerem');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadExercises(search);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search, loadExercises]);

  async function handleCreateExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateError(null);
    setCreateSuccess(null);

    if (!name.trim()) {
      setCreateError('Podaj nazwę ćwiczenia');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          category: category || null,
          notes: notes || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setCreateError(data?.error ?? 'Nie udało się dodać ćwiczenia');
        return;
      }

      setName('');
      setCategory('');
      setNotes('');
      setCreateSuccess('Dodano ćwiczenie');

      await loadExercises(search);
    } catch {
      setCreateError('Wystąpił błąd połączenia z serwerem');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Lista ćwiczeń</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Wyszukiwarka korzysta z parametru query: /api/exercises?search=...
          </p>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="exercise-search">
            Wyszukaj ćwiczenie
          </label>
          <input
            id="exercise-search"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
            placeholder="np. bench, squat, pull..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            Ładowanie ćwiczeń...
          </div>
        ) : null}

        {listError ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-sm text-red-200">
            {listError}
          </div>
        ) : null}

        {!isLoading && !listError && exercises.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
            Brak ćwiczeń pasujących do wyszukiwania.
          </div>
        ) : null}

        {!isLoading && !listError && exercises.length > 0 ? (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <article
                key={exercise.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {exercise.category ?? 'Bez kategorii'}
                    </p>

                    {exercise.notes ? (
                      <p className="mt-2 text-sm text-zinc-400">{exercise.notes}</p>
                    ) : null}
                  </div>

                  <span
                    className={
                      exercise.source === 'SYSTEM'
                        ? 'w-fit rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-300'
                        : 'w-fit rounded-full border border-sky-800 bg-sky-950/50 px-3 py-1 text-xs font-medium text-sky-300'
                    }
                  >
                    {exercise.source === 'SYSTEM' ? 'Systemowe' : 'Własne'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Dodaj własne ćwiczenie</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Ćwiczenia własne są widoczne tylko dla zalogowanego użytkownika.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleCreateExercise}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="exercise-name">
              Nazwa
            </label>
            <input
              id="exercise-name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
              placeholder="np. Bench Press pauza 2s"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="exercise-category">
              Kategoria
            </label>
            <input
              id="exercise-category"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
              placeholder="np. Chest, Back, Legs"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="exercise-notes">
              Notatka
            </label>
            <textarea
              id="exercise-notes"
              className="min-h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
              placeholder="Krótki opis albo wskazówka techniczna"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {createError ? (
            <div className="rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200">
              {createError}
            </div>
          ) : null}

          {createSuccess ? (
            <div className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
              {createSuccess}
            </div>
          ) : null}

          <button
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? 'Dodawanie...' : 'Dodaj ćwiczenie'}
          </button>
        </form>
      </aside>
    </div>
  );
}