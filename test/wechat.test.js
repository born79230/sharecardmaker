import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePseudoText } from '../src/lib/wechat.js';

test('materializes decoration strings and editorial chapter counters', () => {
  assert.equal(resolvePseudoText('none'), '');
  assert.equal(resolvePseudoText('normal'), '');
  assert.equal(resolvePseudoText('"◆"'), '◆');
  assert.equal(resolvePseudoText('"\\201c"'), '“');
  assert.equal(resolvePseudoText('counter(editorial-section, decimal-leading-zero)', 3), '03');
  assert.equal(resolvePseudoText('"第 " counter(section) " 章"', 2), '第  2  章');
});
