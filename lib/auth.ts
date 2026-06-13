import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'app_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // to jest na 7 dni

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not set');
    }

    return new TextEncoder().encode(secret);
}

export async function signSessionToken(userId: string): Promise<string> {
    return new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
        .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        const userId = payload.userId;

        if (typeof userId !== 'string') {
            return null;
        }

        return userId;
    } catch {
        return null;
    }
}

export async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    return verifySessionToken(token);
}

export async function requireCurrentUserId(): Promise<string> {
    const userId = await getCurrentUserId();

    if (!userId) {
        throw new Error('UNAUTHORIZED');
    }

    return userId;
}

export const sessionCookie = {
    name: SESSION_COOKIE_NAME,
    maxAge: SESSION_TTL_SECONDS,
};