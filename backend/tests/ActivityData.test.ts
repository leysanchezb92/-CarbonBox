import { describe, expect, it } from 'vitest';
import { ActivityData } from '../src/document-processing/domain/entities/ActivityData';

const valid = { category: 'Electricity', amount: '150.5', unit: 'kWh', date: '2024-01-15' };

describe('ActivityData.create', () => {
  it('crea la entidad con una fila válida', () => {
    const result = ActivityData.create('upload-1', valid);
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.amount).toBe(150.5);
      expect(result.value.date.toISOString()).toBe('2024-01-15T00:00:00.000Z');
      expect(result.value.uploadId).toBe('upload-1');
    }
  });

  it('recorta espacios en los campos', () => {
    const result = ActivityData.create('u', { ...valid, category: '  Water ', unit: ' m3 ' });
    expect(result.isRight() && result.value.category).toBe('Water');
  });

  it.each([
    ['category vacío', { category: ' ' }],
    ['unit vacío', { unit: '' }],
    ['amount cero', { amount: '0' }],
    ['amount negativo', { amount: '-5' }],
    ['amount no numérico', { amount: 'abc' }],
    ['amount con notación científica', { amount: '1e3' }],
    ['amount vacío', { amount: '' }],
    ['fecha con otro formato', { date: '15/01/2024' }],
    ['fecha inexistente', { date: '2024-02-30' }],
    ['mes 13', { date: '2024-13-01' }],
    ['fecha vacía', { date: '' }],
  ])('rechaza %s', (_name, override) => {
    const result = ActivityData.create('u', { ...valid, ...override });
    expect(result.isLeft()).toBe(true);
  });

  it('acepta el 29 de febrero solo en año bisiesto', () => {
    expect(ActivityData.create('u', { ...valid, date: '2024-02-29' }).isRight()).toBe(true);
    expect(ActivityData.create('u', { ...valid, date: '2023-02-29' }).isLeft()).toBe(true);
  });
});
