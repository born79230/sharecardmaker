import { toBlob, toPng } from 'html-to-image';
import { parseProject, serializeProject } from '../model/project.js';
import { definePlatform } from './contract.js';

const PROJECT_STORAGE_KEY = 'share-card-maker.project.v1';

export async function exportCaptureImage(node, action) {
  if (action === 'copy' && navigator.clipboard && globalThis.ClipboardItem) {
    try {
      const blob = await toBlob(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: 'transparent'
      });

      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return 'copied';
      }
    } catch {
      // Browsers often restrict image clipboard writes outside secure contexts.
    }
  }

  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: 'transparent'
  });
  downloadDataUrl(dataUrl, `share-card-${Date.now()}.png`);

  return action === 'copy' ? 'copy-fallback-downloaded' : 'downloaded';
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function getCurrentCoordinates() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('geolocation-unavailable'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(coords),
      reject,
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000
      }
    );
  });
}

export function loadProject() {
  try {
    const serialized = globalThis.localStorage?.getItem(PROJECT_STORAGE_KEY);
    return serialized ? parseProject(serialized) : null;
  } catch {
    return null;
  }
}

export function saveProject(project) {
  try {
    globalThis.localStorage?.setItem(PROJECT_STORAGE_KEY, serializeProject(project));
    return true;
  } catch {
    return false;
  }
}

export const browserPlatform = definePlatform({
  exportCaptureImage,
  getCurrentCoordinates,
  loadProject,
  readImageFile,
  saveProject
});

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
