'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, type DragEvent } from 'react';
import { useCreateUpload } from '../api/uploadsApi';

function isCsv(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv');
}

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const createUpload = useCreateUpload();

  function selectFile(selected: File | undefined) {
    createUpload.reset();
    setProgress(0);
    if (!selected) return;
    if (!isCsv(selected)) {
      setFile(null);
      setValidationError('Solo se permiten archivos .csv');
      return;
    }
    setValidationError(null);
    setFile(selected);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  function handleSubmit() {
    if (!file) return;
    createUpload.mutate(
      { file, onProgress: setProgress },
      { onSuccess: (upload) => router.push(`/uploads/${upload.id}`) },
    );
  }

  const isUploading = createUpload.isPending;
  const errorMessage = validationError ?? createUpload.error?.message ?? null;

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">Subir archivo CSV</h1>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'
        }`}
      >
        <p className="text-slate-700">Arrastra aquí tu archivo .csv o haz clic para elegirlo</p>
        <p className="mt-1 text-sm text-slate-500">Columnas esperadas: category, amount, unit, date</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
      </div>

      {file && (
        <p className="mt-4 text-sm text-slate-700">
          Archivo seleccionado: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {isUploading && (
        <div className="mt-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-sm text-slate-500">Subiendo... {progress}%</p>
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isUploading}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isUploading ? 'Subiendo...' : 'Subir archivo'}
      </button>
    </section>
  );
}
