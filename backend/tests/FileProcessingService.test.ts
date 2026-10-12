import { describe, expect, it } from 'vitest';
import { CsvParserService } from '../src/document-processing/application/services/CsvParserService';
import { FileProcessingService } from '../src/document-processing/application/services/FileProcessingService';

const service = new FileProcessingService(new CsvParserService());

describe('FileProcessingService', () => {
  it('procesa un CSV válido', () => {
    const result = service.process('u1', 'category,amount,unit,date\nWater,120,m3,2024-01-19\nWaste,45.8,kg,2024-01-18\n');
    expect(result).toMatchObject({ kind: 'processed', totalRows: 2, rowErrors: [] });
    expect(result.kind === 'processed' && result.validRows).toHaveLength(2);
  });

  it('separa filas válidas de inválidas e informa la línea de cada error', () => {
    const csv = 'category,amount,unit,date\nWater,120,m3,2024-01-19\nWaste,-1,kg,2024-01-18\nGas,5,m3\n';
    const result = service.process('u1', csv);
    expect(result.kind).toBe('processed');
    if (result.kind === 'processed') {
      expect(result.validRows).toHaveLength(1);
      expect(result.rowErrors.map((e) => e.line)).toEqual([3, 4]);
    }
  });

  it('acepta las columnas en otro orden y en mayúsculas', () => {
    const result = service.process('u1', 'DATE,Unit,Amount,Category\n2024-01-19,m3,120,Water\n');
    expect(result.kind === 'processed' && result.validRows[0]?.category).toBe('Water');
  });

  it('rechaza el archivo si falta una columna obligatoria', () => {
    const result = service.process('u1', 'category,amount,unit\nWater,1,m3\n');
    expect(result).toMatchObject({ kind: 'invalid_file' });
    expect(result.kind === 'invalid_file' && result.message).toContain('date');
  });

  it('rechaza un archivo vacío o sin filas de datos', () => {
    expect(service.process('u1', '').kind).toBe('invalid_file');
    expect(service.process('u1', 'category,amount,unit,date\n').kind).toBe('invalid_file');
  });
});
