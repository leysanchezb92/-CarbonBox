import type { UploadStatus } from '../types/upload.types';

const STATUS_STYLES: Record<UploadStatus, { label: string; classes: string }> = {
  PENDING: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800 ring-yellow-300' },
  PROCESSING: { label: 'Procesando', classes: 'bg-blue-100 text-blue-800 ring-blue-300' },
  COMPLETED: { label: 'Completado', classes: 'bg-green-100 text-green-800 ring-green-300' },
  FAILED: { label: 'Fallido', classes: 'bg-red-100 text-red-800 ring-red-300' },
};

export function ProcessingStatus({ status }: { status: UploadStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.classes}`}>
      {style.label}
    </span>
  );
}
