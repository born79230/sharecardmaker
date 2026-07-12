const REQUIRED_METHODS = [
  'exportCaptureImage',
  'getCurrentCoordinates',
  'loadProject',
  'readImageFile',
  'saveProject'
];

export function definePlatform(adapter) {
  for (const method of REQUIRED_METHODS) {
    if (typeof adapter?.[method] !== 'function') {
      throw new TypeError(`Platform adapter is missing ${method}()`);
    }
  }

  return Object.freeze({ ...adapter });
}
