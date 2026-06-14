'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        setIsLoading(true);

        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });

        router.push('/login');
        router.refresh();
    }

    return (
        <button
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-red-500 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isLoading}
            onClick={handleLogout}
        >
            {isLoading ? 'Wylogowywanie...' : 'Wyloguj'}
        </button>
    );
}