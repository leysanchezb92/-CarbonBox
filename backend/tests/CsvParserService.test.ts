import { describe, expect, it } from 'vitest';
import { CsvParserService } from '../src/document-processing/application/services/CsvParserService';

const parser = new CsvParserService();

describe('CsvParserService', () => {
  it('separa registros y campos', () => {
    const records = parser.parse('category,amount\nWater,120\n');
    expect(records).toEqual([
      { line: 1, fields: ['category', 'amount'] },
      { line: 2, fields: ['Water', '120'] },
    ]);
  });

  it('acepta saltos de línea de Windows (\\r\\n)', () => {
    const records = parser.parse('a,b\r\n1,2\r\n');
    expect(records.map((r) => r.fields)).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('respeta comas y comillas escapadas dentro de campos entre comillas', () => {
    const records = parser.parse('a,b\n"Gas, natural","dijo ""hola"""');
    expect(records[1]?.fields).toEqual(['Gas, natural', 'dijo "hola"']);
  });

  it('ignora las líneas en blanco', () => {
    const records = parser.parse('a,b\n\n1,2\n\n');
    expect(records).toHaveLength(2);
  });

  it('quita el BOM inicial', () => {
    const records = parser.parse('﻿category,amount\n');
    expect(records[0]?.fields[0]).toBe('category');
  });

  it('informa la línea real del registro aunque haya campos multilínea', () => {
    const records = parser.parse('a,b\n"uno\ndos",x\n3,4\n');
    expect(records.map((r) => r.line)).toEqual([1, 2, 4]);
  });

  it('devuelve una lista vacía con contenido vacío', () => {
    expect(parser.parse('')).toEqual([]);
  });
});
