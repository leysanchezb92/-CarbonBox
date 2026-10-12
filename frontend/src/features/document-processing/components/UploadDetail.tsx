'use client';

import Link from 'next/link';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ApiError } from '@/shared/lib/api-client';
import { useUpload } from '../api/uploadsApi';
import { isActiveStatus } from '../types/upload.types';
import { ProcessingStatus } from './ProcessingStatus';
import { ResultsTable } from './ResultsTable';

export function UploadDetail({ id }: { id: string }) {
  const { data: upload, isLoading, error } = useUpload(id);

  const backLink = (
    <Link href="/uploads" className="inline-block rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
      ← Volver a la lista
    </Link>
  );

  if (isLoading) return <LoadingSpinner />;

  if (error || !upload) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <section className="space-y-4">
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {notFound ? 'No se encontró este upload.' : (error?.message ?? 'No se pudo cargar el upload.')}
        </p>
        {backLink}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{upload.fileName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Subido el {new Date(upload.createdAt).toLocaleString('es-CO')}
          </p>
        </div>
        <ProcessingStatus status={upload.status} />
      </div>

      {isActiveStatus(upload.status) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            {upload.status === 'PENDING' ? 'En cola, esperando a ser procesado...' : 'Procesando el archivo...'}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-busy="true">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
          </div>
          <p className="mt-2 text-xs text-blue-800">Esta página se actualiza sola cada 3 segundos.</p>
        </div>
      )}

      {upload.status === 'FAILED' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="font-medium text-red-800">No se pudo procesar el archivo</p>
          <p className="mt-1 text-sm text-red-700">{upload.errorMessage ?? 'Ocurrió un error inesperado.'}</p>
        </div>
      )}

      {upload.status === 'COMPLETED' && (
        <>
          <dl className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-sm text-slate-500">Filas totales</dt>
              <dd className="text-2xl font-semibold">{upload.totalRows ?? 0}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-sm text-slate-500">Procesadas</dt>
              <dd className="text-2xl font-semibold text-green-700">{upload.processedRows ?? 0}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-sm text-slate-500">Con errores</dt>
              <dd className="text-2xl font-semibold text-red-700">{upload.failedRows ?? 0}</dd>
            </div>
          </dl>
          <ResultsTable uploadId={upload.id} enabled />
        </>
      )}

      {backLink}
    </section>
  );
}
