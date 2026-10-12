import { Suspense } from 'react';
import { UploadDetail } from '@/features/document-processing/components/UploadDetail';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

async function UploadDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // en esta versión de Next.js, params es una promesa
  return <UploadDetail id={id} />;
}

export default function UploadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando..." />}>
      <UploadDetailContent params={params} />
    </Suspense>
  );
}
