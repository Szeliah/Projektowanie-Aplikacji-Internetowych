'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('demo@liftlog.local');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            setError(data?.error ?? 'Nie udało się zalogować');
            return;
        }

        router.push('/dashboard');
        router.refresh();
    } catch {
        setError('Wystąpił błąd połączenia z serwerem');
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="password">
          Hasło
        </label>
        <input
          id="password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <button
        className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Konto demo: demo@liftlog.local / password123
      </p>
    </form>
  );
}