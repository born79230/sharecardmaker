import {
  ASPECTS,
  BACKGROUNDS,
  DEFAULT_PADDING,
  DEFAULT_RADIUS,
  INITIAL_CODE,
  INITIAL_CODE_TITLE,
  INITIAL_IMAGE_CAPTION,
  INITIAL_POST,
  INITIAL_TEXT,
  SCENES,
  SHADOWS,
  THEME_OPTIONS
} from '../presets.js';
import { getTodayDateValue } from '../lib/formatters.js';

export const PROJECT_SCHEMA_VERSION = 1;

const MODES = new Set(['text', 'post', 'code', 'image']);
const BACKGROUND_VALUES = new Set(BACKGROUNDS.map((item) => item.value));
const SCENE_IDS = new Set(SCENES.map((item) => item.id));
const SHADOW_VALUES = new Set(SHADOWS.map((item) => item.value));
const THEME_IDS = new Set(THEME_OPTIONS.map((item) => item.id));
const ASPECT_IDS = new Set(Object.keys(ASPECTS));

export function createDefaultProject({ today = getTodayDateValue() } = {}) {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    mode: 'text',
    markdown: INITIAL_TEXT,
    post: { ...INITIAL_POST },
    code: INITIAL_CODE,
    codeTitle: INITIAL_CODE_TITLE,
    imageSrc: '',
    imageCaption: INITIAL_IMAGE_CAPTION,
    background: BACKGROUNDS[0].value,
    scene: 'none',
    shadow: SHADOWS[0].value,
    theme: 'light',
    aspect: 'auto',
    padding: DEFAULT_PADDING,
    paddingX: DEFAULT_PADDING,
    radius: DEFAULT_RADIUS,
    border: true,
    borderWidth: 1,
    quoteMarks: false,
    watermarkTextEnabled: true,
    watermarkText: 'Share Card',
    watermarkLocationEnabled: false,
    watermarkLocationText: '',
    watermarkDateEnabled: false,
    watermarkDateText: today
  };
}

export function normalizeProject(value, options) {
  const defaults = createDefaultProject(options);
  if (!isRecord(value)) return defaults;

  const project = {
    ...defaults,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    mode: pickFromSet(value.mode, MODES, defaults.mode),
    markdown: pickString(value.markdown, defaults.markdown),
    post: normalizePost(value.post, defaults.post),
    code: pickString(value.code, defaults.code),
    codeTitle: pickString(value.codeTitle, defaults.codeTitle),
    imageSrc: pickString(value.imageSrc, defaults.imageSrc),
    imageCaption: pickString(value.imageCaption, defaults.imageCaption),
    background: pickFromSet(value.background, BACKGROUND_VALUES, defaults.background),
    scene: pickFromSet(value.scene, SCENE_IDS, defaults.scene),
    shadow: pickFromSet(value.shadow, SHADOW_VALUES, defaults.shadow),
    theme: pickFromSet(value.theme, THEME_IDS, defaults.theme),
    aspect: pickFromSet(value.aspect, ASPECT_IDS, defaults.aspect),
    padding: clampNumber(value.padding, 0, 140, defaults.padding),
    paddingX: clampNumber(value.paddingX, 0, 180, defaults.paddingX),
    radius: clampNumber(value.radius, 0, 52, defaults.radius),
    border: pickBoolean(value.border, defaults.border),
    borderWidth: clampNumber(value.borderWidth, 0, 16, defaults.borderWidth),
    quoteMarks: pickBoolean(value.quoteMarks, defaults.quoteMarks),
    watermarkTextEnabled: pickBoolean(value.watermarkTextEnabled, defaults.watermarkTextEnabled),
    watermarkText: pickString(value.watermarkText, defaults.watermarkText),
    watermarkLocationEnabled: pickBoolean(value.watermarkLocationEnabled, defaults.watermarkLocationEnabled),
    watermarkLocationText: pickString(value.watermarkLocationText, defaults.watermarkLocationText),
    watermarkDateEnabled: pickBoolean(value.watermarkDateEnabled, defaults.watermarkDateEnabled),
    watermarkDateText: pickString(value.watermarkDateText, defaults.watermarkDateText)
  };

  return enforceProjectInvariants(project);
}

export function projectReducer(state, action) {
  if (action.type === 'set-field') {
    const currentValue = state[action.field];
    const nextValue = typeof action.value === 'function'
      ? action.value(currentValue)
      : action.value;
    return enforceProjectInvariants({ ...state, [action.field]: nextValue });
  }

  if (action.type === 'patch') {
    return enforceProjectInvariants({ ...state, ...action.value });
  }

  if (action.type === 'hydrate') {
    return normalizeProject(action.value);
  }

  return state;
}

export function serializeProject(project) {
  const normalized = normalizeProject(project);
  return JSON.stringify({
    ...normalized,
    imageSrc: normalized.imageSrc.startsWith('data:') ? '' : normalized.imageSrc
  });
}

export function parseProject(serialized, options) {
  if (typeof serialized !== 'string' || !serialized.trim()) {
    return createDefaultProject(options);
  }

  try {
    return normalizeProject(JSON.parse(serialized), options);
  } catch {
    return createDefaultProject(options);
  }
}

function enforceProjectInvariants(project) {
  if (project.padding === 0 && project.paddingX === 0 && project.radius !== 0) {
    return { ...project, radius: 0 };
  }
  return project;
}

function normalizePost(value, defaults) {
  if (!isRecord(value)) return { ...defaults };
  return {
    author: pickString(value.author, defaults.author),
    handle: pickString(value.handle, defaults.handle),
    content: pickString(value.content, defaults.content),
    meta: pickString(value.meta, defaults.meta),
    verified: pickBoolean(value.verified, defaults.verified)
  };
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function pickString(value, fallback) {
  return typeof value === 'string' ? value : fallback;
}

function pickBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

function pickFromSet(value, allowedValues, fallback) {
  return allowedValues.has(value) ? value : fallback;
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
