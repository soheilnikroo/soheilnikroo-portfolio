/**
 * A tiny Result type for use-cases / Server Actions so the business layer can
 * return typed success/failure without throwing across the UI boundary.
 */
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
