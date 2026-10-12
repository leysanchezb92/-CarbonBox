import axios, { AxiosError } from 'axios';

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

export const apiClient = axios.create({ baseURL: API_URL });

// Todo error de red o de la API sale como ApiError, con el { error, message } del backend.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;
    const failure: AxiosError<{ error?: string; message?: string }> = error;

    if (failure.response === undefined) {
      throw new ApiError(CONNECTION_ERROR_MESSAGE, 0);
    }
    const { status, data } = failure.response;
    throw new ApiError(data?.message ?? `Error ${status} del servidor`, status, data?.error);
  },
);

export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path);
  return response.data;
}
