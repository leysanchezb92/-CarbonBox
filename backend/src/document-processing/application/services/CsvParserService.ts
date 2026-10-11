export interface CsvRecord {
  /** Número de línea del archivo donde empieza el registro (1 = encabezado). */
  line: number;
  fields: string[];
}

export class CsvParserService {
  parse(content: string): CsvRecord[] {
    const text = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;

    const records: CsvRecord[] = [];
    let fields: string[] = [];
    let field = '';
    let inQuotes = false;
    let line = 1;
    let recordLine = 1;

    const endRecord = (): void => {
      fields.push(field);
      field = '';
      const isBlankLine = fields.length === 1 && (fields[0] ?? '').trim() === '';
      if (!isBlankLine) {
        records.push({ line: recordLine, fields });
      }
      fields = [];
    };

    for (let i = 0; i < text.length; i++) {
      const char = text[i] as string;

      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          if (char === '\n') line++;
          field += char;
        }
        continue;
      }

      if (char === '"' && field === '') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(field);
        field = '';
      } else if (char === '\r') {
        // se ignora: el \n que sigue cierra la línea
      } else if (char === '\n') {
        endRecord();
        line++;
        recordLine = line;
      } else {
        field += char;
      }
    }

    if (field !== '' || fields.length > 0) {
      endRecord();
    }
    return records;
  }
}
