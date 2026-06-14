import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/LogoutButton';
import { getCurrentUserId } from '@/lib/auth';

import { WorkoutDetails } from './WorkoutDetails';

type WorkoutDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WorkoutDetailsPage({
  params,
}: WorkoutDetailsPageProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">LiftLog</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Szczegóły treningu
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Dane pobierane z endpointu REST /api/workouts/[id].
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
              href="/workouts"
            >
              Wróć
            </Link>

            <LogoutButton />
          </div>
        </header>

        <WorkoutDetails workoutId={id} />
      </div>
    </main>
  );
}