import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECT_SCHEMA_VERSION,
  createDefaultProject,
  normalizeProject,
  parseProject,
  projectReducer,
  serializeProject
} from '../src/model/project.js';

test('creates a deterministic versioned project', () => {
  const project = createDefaultProject({ today: '2026-07-12' });

  assert.equal(project.schemaVersion, PROJECT_SCHEMA_VERSION);
  assert.equal(project.post.author, 'Siuloong');
  assert.equal(project.watermarkDateText, '2026-07-12');
  assert.equal(project.aspect, 'auto');
});

test('normalizes unknown values and enforces no-pad radius', () => {
  const project = normalizeProject({
    mode: 'unknown',
    aspect: 'cinema',
    padding: -12,
    paddingX: 0,
    radius: 48,
    post: { author: 'Mobile Author', verified: false }
  }, { today: '2026-07-12' });

  assert.equal(project.mode, 'text');
  assert.equal(project.aspect, 'auto');
  assert.equal(project.padding, 0);
  assert.equal(project.paddingX, 0);
  assert.equal(project.radius, 0);
  assert.equal(project.post.author, 'Mobile Author');
  assert.equal(project.post.verified, false);
});

test('reducer keeps the no-pad invariant across field updates', () => {
  const initial = createDefaultProject({ today: '2026-07-12' });
  const noVerticalPad = projectReducer(initial, {
    type: 'set-field',
    field: 'padding',
    value: 0
  });
  const noPad = projectReducer(noVerticalPad, {
    type: 'set-field',
    field: 'paddingX',
    value: 0
  });
  const radiusAttempt = projectReducer(noPad, {
    type: 'set-field',
    field: 'radius',
    value: 24
  });

  assert.equal(noPad.radius, 0);
  assert.equal(radiusAttempt.radius, 0);
});

test('serialization omits large uploaded data URLs and remains recoverable', () => {
  const project = {
    ...createDefaultProject({ today: '2026-07-12' }),
    markdown: 'Persist me',
    imageSrc: 'data:image/png;base64,large-payload'
  };
  const serialized = serializeProject(project);
  const restored = parseProject(serialized, { today: '2026-07-12' });

  assert.equal(restored.markdown, 'Persist me');
  assert.equal(restored.imageSrc, '');
});

test('invalid stored JSON falls back to a valid project', () => {
  const restored = parseProject('{not-json', { today: '2026-07-12' });

  assert.equal(restored.schemaVersion, PROJECT_SCHEMA_VERSION);
  assert.equal(restored.mode, 'text');
});
