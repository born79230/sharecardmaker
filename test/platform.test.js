import test from 'node:test';
import assert from 'node:assert/strict';
import { definePlatform } from '../src/platform/contract.js';

const completeAdapter = {
  exportCaptureImage() {},
  getCurrentCoordinates() {},
  loadProject() {},
  readImageFile() {},
  saveProject() {}
};

test('accepts and freezes a complete platform adapter', () => {
  const platform = definePlatform(completeAdapter);

  assert.equal(Object.isFrozen(platform), true);
  assert.equal(platform.loadProject, completeAdapter.loadProject);
});

test('rejects incomplete platform adapters with a useful error', () => {
  assert.throws(
    () => definePlatform({}),
    /Platform adapter is missing exportCaptureImage\(\)/
  );
});
