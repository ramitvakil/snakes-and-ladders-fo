const BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Thin fetch wrapper that injects the JWT token from localStorage
 * and parses JSON responses.
 */
async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const stored = localStorage.getItem('snakes-auth');
  let token: string | null = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      token = parsed?.state?.token ?? null;
    } catch {
      /* ignore */
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error ?? res.statusText, body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Convenience methods ──

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T = unknown>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  patch: <T = unknown>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
