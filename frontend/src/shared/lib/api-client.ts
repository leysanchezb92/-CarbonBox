export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const CONNECTION_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. ¿Está encendido el backend (npm run dev)?';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Convierte la respuesta de error del backend ({ error, message }) en un ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  const parsed = body as { error?: string; message?: string } | null;
  return new ApiError(parsed?.message ?? `Error ${status} del servidor`, status, parsed?.error);
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`);
  } catch {
    throw new ApiError(CONNECTION_ERROR_MESSAGE, 0);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw toApiError(response.status, body);
  }
  return body as T;
}
