export const BACKGROUNDS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #ffd166 0%, #ef476f 48%, #26547c 100%)' },
  { name: 'Lagoon', value: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 55%, #073b4c 100%)' },
  { name: 'Paper', value: 'linear-gradient(135deg, #fff7e6 0%, #f1f5f9 58%, #dbeafe 100%)' },
  { name: 'Ink', value: 'linear-gradient(135deg, #111827 0%, #1f2937 46%, #0f766e 100%)' },
  { name: 'Bloom', value: 'radial-gradient(circle at 10% 20%, #fdf2f8 0%, transparent 32%), linear-gradient(135deg, #fb7185 0%, #fef3c7 48%, #38bdf8 100%)' },
  { name: 'Signal', value: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 50%, #f97316 100%)' },
  { name: 'Slate', value: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 42%, #334155 100%)' },
  { name: 'Candy', value: 'linear-gradient(135deg, #f9a8d4 0%, #fde68a 50%, #86efac 100%)' }
];

export const SCENES = [
  { id: 'none', label: 'None' },
  { id: 'aura', label: 'Aura' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'rings', label: 'Rings' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'paper', label: 'Paper' },
  { id: 'dots', label: 'Dots' },
  { id: 'ribbons', label: 'Ribbons' },
  { id: 'glass', label: 'Glass' }
];

export const SHADOWS = [
  { name: 'Soft', value: '0 28px 80px rgba(15, 23, 42, 0.24)' },
  { name: 'Sharp', value: '12px 12px 0 rgba(15, 23, 42, 0.72)' },
  { name: 'Float', value: '0 18px 45px rgba(2, 132, 199, 0.28), 0 6px 18px rgba(15, 23, 42, 0.18)' },
  { name: 'None', value: 'none' }
];

export const ASPECTS = {
  square: { label: '1:1', width: 860, height: 860 },
  portrait: { label: '4:5', width: 860, height: 1075 },
  story: { label: '9:16', width: 720, height: 1280 },
  wide: { label: '16:9', width: 1100, height: 619 },
  auto: { label: 'Auto', width: 960, height: null }
};

export const THEME_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'glass', label: 'Glass' }
];

export const BORDER_WIDTH_PRESETS = [0, 1, 4, 8, 16];
export const DEFAULT_PADDING = 56;
export const DEFAULT_RADIUS = 32;
export const AUTO_SHELL_HEIGHT = 760;
export const MIN_PREVIEW_SCALE = 0.2;
export const PREVIEW_STAGE_GUTTER = 36;

export const INITIAL_TEXT = `# 把想法变成一张可以分享的图

输入 **Markdown**、帖子文案或代码，然后调整背景、阴影、边框和比例。

> 适合发到微博、小红书、X、LinkedIn 或作品集。

\`Copy PNG\` 可以直接复制到剪贴板。`;

export const INITIAL_POST = {
  author: 'Siuloong',
  handle: '@sharecard',
  content:
    '真正好用的截图生成器不该只会“截图”。它应该让文字、留白、颜色、阴影和比例一起服务于传播场景。',
  meta: '今天 16:30',
  verified: true
};

export const INITIAL_CODE = `export async function copyShot(node) {
  const blob = await toBlob(node, {
    pixelRatio: 2,
    cacheBust: true
  });

  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
}`;

export const INITIAL_CODE_TITLE = 'copy-shot.js';
export const INITIAL_IMAGE_CAPTION = '把产品截图、照片或海报放进同一套分享模板里。';
