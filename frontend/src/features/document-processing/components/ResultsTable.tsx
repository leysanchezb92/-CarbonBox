'use client';

import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useUploadResults } from '../api/uploadsApi';

export function ResultsTable({ uploadId, enabled }: { uploadId: string; enabled: boolean }) {
  const { data, isLoading, error } = useUploadResults(uploadId, enabled);

  if (isLoading) return <LoadingSpinner label="Cargando datos procesados..." />;
  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
        {error.message}
      </p>
    );
  }
  if (!data) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Cantidad</th>
            <th className="px-4 py-3 font-medium">Unidad</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.data.map((row, index) => (
            <tr key={`${row.category}-${row.date}-${index}`}>
              <td className="px-4 py-3">{row.category}</td>
              <td className="px-4 py-3">{row.amount.toLocaleString('es-CO')}</td>
              <td className="px-4 py-3">{row.unit}</td>
              <td className="px-4 py-3">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
