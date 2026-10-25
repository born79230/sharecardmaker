const MAX_SIDE = 16384;
const MAX_AREA = 16777216;

export function computeExportPixelRatio(width, height) {
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('无法导出空白画布');
  }
  const ratio = Math.floor(Math.min(2, MAX_SIDE / Math.max(width, height), Math.sqrt(MAX_AREA / (width * height))) * 1000) / 1000;
  if (ratio < 0.1) throw new Error('内容过长，请缩短内容后导出');
  return ratio;
}

export async function waitForCaptureAssets(node) {
  const ready = Promise.all([
    node.ownerDocument.fonts?.ready,
    ...Array.from(node.querySelectorAll('img'), async (image) => {
      try {
        await image.decode();
      } catch {
        throw new Error('图片尚未加载或无法读取，请更换图片后重试');
      }
    })
  ]);
  let timeout;
  try {
    await Promise.race([ready, new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error('图片或字体加载超时，请稍后重试')), 15000);
    })]);
  } finally {
    clearTimeout(timeout);
  }
}
