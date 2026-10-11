import { ActivityData } from '../../domain/entities/ActivityData';
import { CsvParserService } from './CsvParserService';

export const REQUIRED_COLUMNS = ['category', 'amount', 'unit', 'date'] as const;

export interface RowError {
  line: number;
  message: string;
}

export type FileProcessingResult =
  | { kind: 'invalid_file'; message: string }
  | { kind: 'processed'; totalRows: number; validRows: ActivityData[]; rowErrors: RowError[] };

/** Recorre el CSV completo: revisa el encabezado y valida cada fila una por una. */
export class FileProcessingService {
  constructor(private readonly csvParser: CsvParserService) {}

  process(uploadId: string, content: string): FileProcessingResult {
    const records = this.csvParser.parse(content);
    const headerRecord = records[0];
    if (headerRecord === undefined) {
      return { kind: 'invalid_file', message: 'El archivo CSV está vacío' };
    }

    const header = headerRecord.fields.map((name) => name.trim().toLowerCase());
    const missing = REQUIRED_COLUMNS.filter((column) => !header.includes(column));
    if (missing.length > 0) {
      return {
        kind: 'invalid_file',
        message: `Faltan columnas obligatorias: ${missing.join(', ')}`,
      };
    }

    const dataRecords = records.slice(1);
    if (dataRecords.length === 0) {
      return { kind: 'invalid_file', message: 'El archivo no tiene filas de datos' };
    }

    const columnIndex = {
      category: header.indexOf('category'),
      amount: header.indexOf('amount'),
      unit: header.indexOf('unit'),
      date: header.indexOf('date'),
    };

    const validRows: ActivityData[] = [];
    const rowErrors: RowError[] = [];

    for (const record of dataRecords) {
      if (record.fields.length !== header.length) {
        rowErrors.push({
          line: record.line,
          message: `se esperaban ${header.length} columnas y hay ${record.fields.length}`,
        });
        continue;
      }

      const result = ActivityData.create(uploadId, {
        category: record.fields[columnIndex.category] ?? '',
        amount: record.fields[columnIndex.amount] ?? '',
        unit: record.fields[columnIndex.unit] ?? '',
        date: record.fields[columnIndex.date] ?? '',
      });

      if (result.isLeft()) {
        rowErrors.push({ line: record.line, message: result.value.message });
      } else {
        validRows.push(result.value);
      }
    }

    return { kind: 'processed', totalRows: dataRecords.length, validRows, rowErrors };
  }
}
