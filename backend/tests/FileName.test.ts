import { describe, expect, it } from 'vitest';
import { FileName } from '../src/document-processing/domain/value-objects/FileName';

describe('FileName.create', () => {
  it('acepta un .csv (sin importar mayúsculas)', () => {
    expect(FileName.create('datos.csv').isRight()).toBe(true);
    expect(FileName.create('DATOS.CSV').isRight()).toBe(true);
  });

  it.each([
    ['vacío', ''],
    ['solo espacios', '   '],
    ['otra extensión', 'datos.xlsx'],
    ['con barra (path traversal)', '../datos.csv'],
    ['con barra invertida', 'a\\b.csv'],
    ['demasiado largo', `${'a'.repeat(252)}.csv`],
  ])('rechaza nombre %s', (_name, value) => {
    expect(FileName.create(value).isLeft()).toBe(true);
  });
});
