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

export const LEGACY_INITIAL_TEXT = `# 把想法变成一张可以分享的图

输入 **Markdown**、帖子文案或代码，然后调整背景、阴影、边框和比例。

> 适合发到微博、小红书、X、LinkedIn 或作品集。

\`Copy PNG\` 可以直接复制到剪贴板。`;

export const TOOL_NAME = 'ShareCardMaker';

export const INITIAL_TEXT = `# ShareCardMaker 功能说明书

把 **Markdown、帖子、代码和图片** 排版成分享图，也能将渲染后的文章直接复制到公众号。

## 01 · 选择内容模式

| 模式 | 用途 |
| --- | --- |
| Text | 编写 Markdown，制作文章长图或复制公众号排版 |
| Post | 编辑作者、账号、正文和认证标记，生成帖子卡片 |
| Code | 输入文件名和代码，生成代码分享图 |
| Image | 上传图片并添加说明文字 |

## 02 · 编写与排版

Text 模式支持标题、**加粗**、*斜体*、引用、列表、表格、链接和代码块，修改后实时预览。

- **20 套正文主题**：3 套适配主题，以及 WeMD 的全部 17 套内置主题。
- **独立调整卡片外观**：Light、Dark、Glass 与正文主题分别设置。
- **代码高亮**：WeMD 正文主题支持常见语言的代码块高亮。

> 在「正文排版」中切换主题，快速比较标题、引用、代码和表格的不同风格。

## 03 · 调整分享图

选择背景、Scene 场景、阴影、圆角、边框和留白。支持 **1:1、4:5、9:16、16:9** 及 Auto 自动高度。

- 长文建议使用 **Auto**，让画布随正文延伸。
- 在 Controls 中分别调整横向、纵向留白。
- 使用 No pad 或 Edge to edge 制作贴边图片。
- 水印可设置工具名称、自定义文字、定位或日期，也可关闭。

## 04 · 复制或下载

1. 点击 **Copy**，将分享图复制为 PNG；浏览器不支持时自动下载。
2. 点击 **Download**，保存 PNG 图片。
3. Text 模式点击 **复制到公众号**，再到公众号正文区域按 ⌘V / Ctrl+V，粘贴带主题排版的富文本。

> 公众号复制仅包含正文排版，不带分享图背景和水印。本地图片请在公众号中重新上传，发布前检查预览效果。

## 05 · 自动保存

文字与样式自动保存在当前浏览器，下次打开可继续编辑。上传的本地图片暂不持久保存，刷新后可能需要重新选择。

---

**快速开始**：替换这份说明书，选择喜欢的主题，然后复制到公众号或导出分享图。`;

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
