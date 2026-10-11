import { readFileSync } from 'node:fs';
import { CsvParserService } from './document-processing/application/services/CsvParserService';
import { FileProcessingService } from './document-processing/application/services/FileProcessingService';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: npx tsx src/scratch-csv.ts <ruta-al-csv>');
  process.exit(1);
}

const content = readFileSync(filePath, 'utf-8');
const service = new FileProcessingService(new CsvParserService());
const result = service.process('prueba', content);

if (result.kind === 'invalid_file') {
  console.log('ARCHIVO INVÁLIDO:', result.message);
} else {
  console.log(
    `Filas: ${result.totalRows} | válidas: ${result.validRows.length} | inválidas: ${result.rowErrors.length}`,
  );
  for (const row of result.validRows) {
    console.log(`  OK   ${row.category} | ${row.amount} ${row.unit} | ${row.date.toISOString().slice(0, 10)}`);
  }
  for (const rowError of result.rowErrors) {
    console.log(`  ERR  línea ${rowError.line}: ${rowError.message}`);
  }
}
