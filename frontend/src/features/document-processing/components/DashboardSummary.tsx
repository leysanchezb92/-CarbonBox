'use client';

import Link from 'next/link';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useUploads } from '../api/uploadsApi';
import { isActiveStatus } from '../types/upload.types';

const SAMPLE_SIZE = 100;

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export function DashboardSummary() {
  const { data, isLoading, error } = useUploads(1, SAMPLE_SIZE);

  const uploads = data?.data ?? [];
  const completed = uploads.filter((upload) => upload.status === 'COMPLETED').length;
  const inProgress = uploads.filter((upload) => isActiveStatus(upload.status)).length;
  const failed = uploads.filter((upload) => upload.status === 'FAILED').length;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      {isLoading && <LoadingSpinner />}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error.message}
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total de uploads" value={data.total} color="text-slate-900" />
            <StatCard label="Completados" value={completed} color="text-green-700" />
            <StatCard label="En proceso" value={inProgress} color="text-blue-700" />
            <StatCard label="Fallidos" value={failed} color="text-red-700" />
          </div>
          {data.total > SAMPLE_SIZE && (
            <p className="mt-3 text-xs text-slate-500">
              Los contadores por estado consideran los {SAMPLE_SIZE} uploads más recientes.
            </p>
          )}
        </>
      )}

      <div className="mt-8 flex gap-3">
        <Link href="/uploads/new" className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          Subir nuevo CSV
        </Link>
        <Link href="/uploads" className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50">
          Ver todos los uploads
        </Link>
      </div>
    </section>
  );
}
