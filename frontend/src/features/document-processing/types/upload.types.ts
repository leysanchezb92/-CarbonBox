export type UploadStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Upload {
  id: string;
  fileName: string;
  status: UploadStatus;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUploads {
  data: Upload[];
  total: number;
  page: number;
  limit: number;
}

export interface UploadStats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
}

export interface ActivityRow {
  category: string;
  amount: number;
  unit: string;
  date: string;
}

export interface UploadResults {
  data: ActivityRow[];
}

/** Un upload "activo" todavía no terminó: hay que seguir preguntando por su estado. */
export function isActiveStatus(status: UploadStatus): boolean {
  return status === 'PENDING' || status === 'PROCESSING';
}
