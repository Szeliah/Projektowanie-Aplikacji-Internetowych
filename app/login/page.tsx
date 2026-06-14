import { redirect } from 'next/navigation';

import { getCurrentUserId } from '@/lib/auth';

import { LoginForm } from './LoginForm';

export default async function LoginPage() {
    const userId = await getCurrentUserId();

    if (userId) {
        redirect('/dashboard');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
            <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-emerald-400">App</p>
            <h1 className="text-3xl font-bold tracking-tight">Zaloguj się</h1>
            <p className="mt-2 text-sm text-zinc-400">
                Śledź treningi, serie, ciężary i progres siłowy.
            </p>
            </div>

            <LoginForm />
        </section>
        </main>
    );
}