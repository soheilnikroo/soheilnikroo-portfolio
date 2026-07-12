const ADMIN_FETCH_TIMEOUT_MS = 50_000;

export function adminFetchTimeoutMessage(): string {
  return "Request timed out or the server could not be reached. Try again in a moment.";
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(ADMIN_FETCH_TIMEOUT_MS),
  });
}
