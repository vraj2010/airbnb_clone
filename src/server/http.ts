import { NextResponse } from 'next/server';
import { z } from 'zod';
import { NotFoundError } from '@/server/services/listing-service';

/**
 * One error shape for every route, so a client never has to guess.
 * `{ error: { code, message, details? } }`
 */
type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error: { code, message, details } }, { status });
}

/**
 * Maps a thrown domain error to a status code. Route handlers stay free of try/catch
 * ladders, and an unexpected error can never leak a stack trace to the client.
 */
export function handleError(err: unknown) {
  if (err instanceof NotFoundError) return fail(404, 'not_found', err.message);
  if (err instanceof z.ZodError) {
    return fail(400, 'invalid_request', 'Request parameters failed validation', err.issues);
  }
  console.error('[api] unhandled', err);
  return fail(500, 'internal_error', 'Something went wrong');
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<T>(data, init);
}
