'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useUploads } from '../api/uploadsApi';
import type { Upload } from '../types/upload.types';
import { ProcessingStatus } from './ProcessingStatus';

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO');
}

function processedRowsLabel(upload: Upload): string {
  if (upload.processedRows === null || upload.totalRows === null) return '—';
  return `${upload.processedRows} / ${upload.totalRows}`;
}

export function UploadList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUploads(page, PAGE_SIZE);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Uploads</h1>
        <Link href="/uploads/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Subir CSV
        </Link>
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      )}

      {data && data.data.length === 0 && (
        <p className="rounded-md border border-slate-200 bg-white p-6 text-center text-slate-500">
          Todavía no hay uploads. ¡Sube tu primer CSV!
        </p>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Archivo</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha de subida</th>
                  <th className="px-4 py-3 font-medium">Filas procesadas</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((upload) => (
                  <tr key={upload.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/uploads/${upload.id}`} className="text-blue-700 hover:underline">
                        {upload.fileName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <ProcessingStatus status={upload.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(upload.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{processedRowsLabel(upload)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/uploads/${upload.id}`} className="text-blue-700 hover:underline">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Página {page} de {totalPages} · {data.total} uploads
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
