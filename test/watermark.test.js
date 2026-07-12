import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWatermarkItems } from '../src/lib/watermark.js';

test('builds enabled watermark items once and in display order', () => {
  const items = buildWatermarkItems({
    watermarkTextEnabled: true,
    watermarkText: ' Share Card ',
    watermarkLocationEnabled: true,
    watermarkLocationText: '31.23040, 121.47370',
    watermarkDateEnabled: true,
    watermarkDateText: '2026-07-12'
  });

  assert.deepEqual(items.map((item) => item.id), ['text', 'location', 'date']);
  assert.deepEqual(items.map((item) => item.label), [
    'Share Card',
    '31.23040, 121.47370',
    '2026.07.12'
  ]);
});

test('omits disabled or empty watermark values', () => {
  const items = buildWatermarkItems({
    watermarkTextEnabled: true,
    watermarkText: '   ',
    watermarkLocationEnabled: false,
    watermarkLocationText: 'Shanghai',
    watermarkDateEnabled: false,
    watermarkDateText: '2026-07-12'
  });

  assert.deepEqual(items, []);
});
