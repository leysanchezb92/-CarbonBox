'use client';

import Link from 'next/link';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useUploadStats } from '../api/uploadsApi';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export function DashboardSummary() {
  const { data, isLoading, error } = useUploadStats();

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total de uploads" value={data.total} color="text-slate-900" />
          <StatCard label="Completados" value={data.completed} color="text-green-700" />
          <StatCard label="En proceso" value={data.inProgress} color="text-blue-700" />
          <StatCard label="Fallidos" value={data.failed} color="text-red-700" />
        </div>
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
