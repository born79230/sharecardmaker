import { toBlob, toPng } from 'html-to-image';

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

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
