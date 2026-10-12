import { describe, expect, it } from 'vitest';
import { Upload } from '../src/document-processing/domain/entities/Upload';
import { FileName } from '../src/document-processing/domain/value-objects/FileName';

function newUpload(): Upload {
  const fileName = FileName.create('datos.csv');
  if (fileName.isLeft()) throw fileName.value;
  return Upload.create({ fileName: fileName.value, fileUrl: 'uploads/datos.csv', userId: 'user-123' });
}

describe('Upload', () => {
  it('nace en PENDING sin conteos', () => {
    const upload = newUpload();
    expect(upload.status.value).toBe('PENDING');
    expect(upload.totalRows).toBeNull();
  });

  it('recorre PENDING → PROCESSING → COMPLETED y guarda los conteos', () => {
    const upload = newUpload();
    expect(upload.startProcessing().isRight()).toBe(true);
    expect(upload.complete({ totalRows: 10, processedRows: 8, failedRows: 2 }).isRight()).toBe(true);
    expect(upload.status.value).toBe('COMPLETED');
    expect([upload.totalRows, upload.processedRows, upload.failedRows]).toEqual([10, 8, 2]);
  });

  it('puede fallar desde PROCESSING y guarda el mensaje', () => {
    const upload = newUpload();
    upload.startProcessing();
    expect(upload.fail('archivo vacío').isRight()).toBe(true);
    expect(upload.status.value).toBe('FAILED');
    expect(upload.errorMessage).toBe('archivo vacío');
  });

  it('no permite completar sin haber pasado por PROCESSING', () => {
    const upload = newUpload();
    const result = upload.complete({ totalRows: 1, processedRows: 1, failedRows: 0 });
    expect(result.isLeft()).toBe(true);
    expect(upload.status.value).toBe('PENDING');
    expect(upload.totalRows).toBeNull();
  });

  it('un upload terminado no vuelve a cambiar de estado', () => {
    const upload = newUpload();
    upload.startProcessing();
    upload.complete({ totalRows: 1, processedRows: 1, failedRows: 0 });
    expect(upload.startProcessing().isLeft()).toBe(true);
    expect(upload.fail('x').isLeft()).toBe(true);
  });
});
