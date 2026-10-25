import test from 'node:test';
import assert from 'node:assert/strict';
import { computeExportPixelRatio, waitForCaptureAssets } from '../src/lib/export.js';

test('export respects canvas area and side limits', () => {
  assert.equal(computeExportPixelRatio(960, 760), 2);
  for (const [width, height] of [[960, 20000], [10000, 10000], [800, 60000]]) {
    const ratio = computeExportPixelRatio(width, height);
    assert.ok(width * height * ratio ** 2 <= 16777216);
    assert.ok(Math.max(width, height) * ratio <= 16384);
  }
  assert.throws(() => computeExportPixelRatio(0, 100));
  assert.throws(() => computeExportPixelRatio(100, Infinity));
});

test('export waits for fonts and reports unreadable images', async () => {
  let decoded = false;
  await waitForCaptureAssets({ ownerDocument: { fonts: { ready: Promise.resolve() } }, querySelectorAll: () => [{ decode: async () => { decoded = true; } }] });
  assert.equal(decoded, true);
  await assert.rejects(waitForCaptureAssets({ ownerDocument: {}, querySelectorAll: () => [{ decode: async () => { throw new Error(); } }] }), /图片/);
});
