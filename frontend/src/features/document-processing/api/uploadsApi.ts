import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiGet } from '@/shared/lib/api-client';
import {
  isActiveStatus,
  type PaginatedUploads,
  type UploadStats,
  type Upload,
  type UploadResults,
} from '../types/upload.types';

const POLLING_INTERVAL_MS = 3000;

export const uploadKeys = {
  all: ['uploads'] as const,
  list: (page: number, limit: number) => ['uploads', 'list', page, limit] as const,
  stats: ['uploads', 'stats'] as const,
  detail: (id: string) => ['uploads', 'detail', id] as const,
  results: (id: string) => ['uploads', 'results', id] as const,
};

export function useUploads(page: number, limit: number) {
  return useQuery({
    queryKey: uploadKeys.list(page, limit),
    queryFn: () => apiGet<PaginatedUploads>(`/api/v1/uploads?page=${page}&limit=${limit}`),
    refetchInterval: (query) => {
      const items = query.state.data?.data ?? [];
      return items.some((upload) => isActiveStatus(upload.status)) ? POLLING_INTERVAL_MS : false;
    },
  });
}

export function useUploadStats() {
  return useQuery({
    queryKey: uploadKeys.stats,
    queryFn: () => apiGet<UploadStats>('/api/v1/uploads/stats'),
    refetchInterval: (query) => ((query.state.data?.inProgress ?? 0) > 0 ? POLLING_INTERVAL_MS : false),
  });
}

export function useUpload(id: string) {
  return useQuery({
    queryKey: uploadKeys.detail(id),
    queryFn: () => apiGet<Upload>(`/api/v1/uploads/${id}`),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status !== undefined && isActiveStatus(status) ? POLLING_INTERVAL_MS : false;
    },
  });
}

export function useUploadResults(id: string, enabled: boolean) {
  return useQuery({
    queryKey: uploadKeys.results(id),
    queryFn: () => apiGet<UploadResults>(`/api/v1/uploads/${id}/results`),
    enabled,
  });
}

export async function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<Upload> {
  const form = new FormData();
  form.append('file', file);

  const response = await apiClient.post<Upload>('/api/v1/uploads', form, {
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return response.data;
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { file: File; onProgress?: (percent: number) => void }) =>
      uploadFile(input.file, input.onProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: uploadKeys.all }),
  });
}
