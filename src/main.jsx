import React, { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { toBlob, toPng } from 'html-to-image';
import {
  BadgeCheck,
  Check,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileImage,
  Image as ImageIcon,
  MessageSquareText,
  Moon,
  Palette,
  Quote,
  Sparkles,
  Sun,
  Type,
  Upload
} from 'lucide-react';
import './styles.css';

const MODES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'post', label: 'Post', icon: MessageSquareText },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'image', label: 'Image', icon: ImageIcon }
];

const BACKGROUNDS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #ffd166 0%, #ef476f 48%, #26547c 100%)' },
  { name: 'Lagoon', value: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 55%, #073b4c 100%)' },
  { name: 'Paper', value: 'linear-gradient(135deg, #fff7e6 0%, #f1f5f9 58%, #dbeafe 100%)' },
  { name: 'Ink', value: 'linear-gradient(135deg, #111827 0%, #1f2937 46%, #0f766e 100%)' },
  { name: 'Bloom', value: 'radial-gradient(circle at 10% 20%, #fdf2f8 0%, transparent 32%), linear-gradient(135deg, #fb7185 0%, #fef3c7 48%, #38bdf8 100%)' },
  { name: 'Signal', value: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 50%, #f97316 100%)' },
  { name: 'Slate', value: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 42%, #334155 100%)' },
  { name: 'Candy', value: 'linear-gradient(135deg, #f9a8d4 0%, #fde68a 50%, #86efac 100%)' }
];

const SHADOWS = [
  { name: 'Soft', value: '0 28px 80px rgba(15, 23, 42, 0.24)' },
  { name: 'Sharp', value: '12px 12px 0 rgba(15, 23, 42, 0.72)' },
  { name: 'Float', value: '0 18px 45px rgba(2, 132, 199, 0.28), 0 6px 18px rgba(15, 23, 42, 0.18)' },
  { name: 'None', value: 'none' }
];

const ASPECTS = {
  square: { label: '1:1', width: 860, height: 860 },
  portrait: { label: '4:5', width: 860, height: 1075 },
  story: { label: '9:16', width: 720, height: 1280 },
  wide: { label: '16:9', width: 1100, height: 619 },
  auto: { label: 'Auto', width: 960, height: null }
};

const INITIAL_TEXT = `# 把想法变成一张可以分享的图

输入 **Markdown**、帖子文案或代码，然后调整背景、阴影、边框和比例。

> 适合发到微博、小红书、X、LinkedIn 或作品集。

\`Copy PNG\` 可以直接复制到剪贴板。`;

const INITIAL_POST = {
  author: 'Deng Shaolong',
  handle: '@sharecard',
  content:
    '真正好用的截图生成器不该只会“截图”。它应该让文字、留白、颜色、阴影和比例一起服务于传播场景。',
  meta: '今天 16:30',
  verified: true
};

const INITIAL_CODE = `export async function copyShot(node) {
  const blob = await toBlob(node, {
    pixelRatio: 2,
    cacheBust: true
  });

  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
}`;

marked.use({
  breaks: true,
  gfm: true
});

function App() {
  const captureRef = useRef(null);
  const stageRef = useRef(null);
  const [mode, setMode] = useState('text');
  const [markdown, setMarkdown] = useState(INITIAL_TEXT);
  const [post, setPost] = useState(INITIAL_POST);
  const [code, setCode] = useState(INITIAL_CODE);
  const [codeTitle, setCodeTitle] = useState('copy-shot.js');
  const [imageSrc, setImageSrc] = useState('');
  const [imageCaption, setImageCaption] = useState('把产品截图、照片或海报放进同一套分享模板里。');
  const [background, setBackground] = useState(BACKGROUNDS[0].value);
  const [shadow, setShadow] = useState(SHADOWS[0].value);
  const [theme, setTheme] = useState('light');
  const [aspect, setAspect] = useState('square');
  const [padding, setPadding] = useState(56);
  const [paddingX, setPaddingX] = useState(56);
  const [radius, setRadius] = useState(32);
  const [border, setBorder] = useState(true);
  const [borderWidth, setBorderWidth] = useState(1);
  const [quoteMarks, setQuoteMarks] = useState(false);
  const [watermark, setWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('Share Card');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const dims = ASPECTS[aspect];
  const shellHeight = dims.height || 760;
  const cleanHtml = useMemo(() => DOMPurify.sanitize(marked.parse(markdown)), [markdown]);

  useLayoutEffect(() => {
    if (!stageRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const nextScale = Math.min(1, (width - 36) / dims.width, (height - 36) / shellHeight);
      setPreviewScale(Math.max(0.35, Number(nextScale.toFixed(3))));
    });

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [dims.width, shellHeight]);

  async function exportPng(action) {
    if (!captureRef.current || busy) return;
    setBusy(true);
    setToast(action === 'copy' ? '正在复制 PNG...' : '正在生成 PNG...');

    try {
      if (action === 'copy' && navigator.clipboard && window.ClipboardItem) {
        try {
          const blob = await toBlob(captureRef.current, {
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: 'transparent'
          });

          if (blob) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setToast('PNG 已复制到剪贴板');
            return;
          }
        } catch {
          setToast('复制受限，正在改为下载 PNG...');
        }
      }

      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: 'transparent'
      });
      const link = document.createElement('a');
      link.download = `share-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setToast(action === 'copy' ? '浏览器不支持图片复制，已改为下载' : 'PNG 已下载');
    } catch (error) {
      console.error(error);
      setToast('导出失败：请检查图片来源或浏览器权限');
    } finally {
      setBusy(false);
      window.setTimeout(() => setToast(''), 2200);
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <main className="app-shell">
      <aside className="editor-panel">
        <div className="brand-row">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <h1>截图生成器</h1>
            <p>文字、帖子和代码转分享图</p>
          </div>
        </div>

        <Segmented
          items={MODES}
          value={mode}
          onChange={setMode}
        />

        <EditorBody
          mode={mode}
          markdown={markdown}
          setMarkdown={setMarkdown}
          post={post}
          setPost={setPost}
          code={code}
          setCode={setCode}
          codeTitle={codeTitle}
          setCodeTitle={setCodeTitle}
          imageSrc={imageSrc}
          imageCaption={imageCaption}
          setImageCaption={setImageCaption}
          onImageUpload={handleImageUpload}
        />
      </aside>

      <section className="preview-panel">
        <div className="preview-toolbar">
          <div>
            <span className="toolbar-kicker">Preview</span>
            <strong>{ASPECTS[aspect].label}</strong>
          </div>
        </div>

        <div className="preview-stage" ref={stageRef}>
          <div
            className="preview-scale-shell"
            style={{
              width: `${dims.width * previewScale}px`,
              height: `${shellHeight * previewScale}px`
            }}
          >
            <div
              className="preview-scale"
              style={{
                width: `${dims.width}px`,
                transform: `scale(${previewScale})`
              }}
            >
              <div
                ref={captureRef}
                className="export-surface"
                style={{
                  width: `${dims.width}px`,
                  minHeight: dims.height ? `${dims.height}px` : 'auto',
                  height: dims.height ? `${dims.height}px` : 'auto',
                  backgroundImage: background
                }}
              >
                <div
                  className="surface-inner"
                  style={{ padding: `${padding}px ${paddingX}px` }}
                >
                  <ShotCard
                    mode={mode}
                    cleanHtml={cleanHtml}
                    post={post}
                    code={code}
                    codeTitle={codeTitle}
                    imageSrc={imageSrc}
                    imageCaption={imageCaption}
                    theme={theme}
                    shadow={shadow}
                    radius={radius}
                    border={border}
                    borderWidth={borderWidth}
                    quoteMarks={quoteMarks}
                  />
                  {watermark && watermarkText.trim() && (
                    <div className="watermark">
                      <Sparkles size={14} />
                      <span>{watermarkText.trim()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BottomDock
        mode={mode}
        background={background}
        setBackground={setBackground}
        shadow={shadow}
        setShadow={setShadow}
        aspect={aspect}
        setAspect={setAspect}
        theme={theme}
        setTheme={setTheme}
        border={border}
        setBorder={(checked) => {
          setBorder(checked);
          if (checked && borderWidth === 0) setBorderWidth(1);
          if (!checked) setBorderWidth(0);
        }}
        borderWidth={borderWidth}
        setBorderWidth={(value) => {
          setBorderWidth(value);
          setBorder(value > 0);
        }}
        padding={padding}
        setPadding={setPadding}
        paddingX={paddingX}
        setPaddingX={setPaddingX}
        radius={radius}
        setRadius={setRadius}
        quoteMarks={quoteMarks}
        setQuoteMarks={setQuoteMarks}
        watermark={watermark}
        setWatermark={setWatermark}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        onCopy={() => exportPng('copy')}
        onDownload={() => exportPng('download')}
        busy={busy}
      />

      <aside className="controls-panel">
        <PanelTitle icon={Palette} title="Style" />
        <ControlGroup label="Background">
          <div className="swatch-grid">
            {BACKGROUNDS.map((item) => (
              <button
                key={item.name}
                className={`swatch ${item.value === background ? 'selected' : ''}`}
                style={{ backgroundImage: item.value }}
                onClick={() => setBackground(item.value)}
                aria-label={item.name}
              >
                {item.value === background && <Check size={16} />}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Aspect">
          <div className="chip-row">
            {Object.entries(ASPECTS).map(([key, item]) => (
              <button
                key={key}
                className={`chip ${aspect === key ? 'selected' : ''}`}
                onClick={() => setAspect(key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup label="Theme">
          <div className="chip-row">
            <button className={`chip icon-chip ${theme === 'light' ? 'selected' : ''}`} onClick={() => setTheme('light')}>
              <Sun size={15} />
              Light
            </button>
            <button className={`chip icon-chip ${theme === 'dark' ? 'selected' : ''}`} onClick={() => setTheme('dark')}>
              <Moon size={15} />
              Dark
            </button>
            <button className={`chip icon-chip ${theme === 'glass' ? 'selected' : ''}`} onClick={() => setTheme('glass')}>
              <Sparkles size={15} />
              Glass
            </button>
          </div>
        </ControlGroup>

        <ControlGroup label="Shadow">
          <div className="chip-row">
            {SHADOWS.map((item) => (
              <button
                key={item.name}
                className={`chip ${shadow === item.value ? 'selected' : ''}`}
                onClick={() => setShadow(item.value)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </ControlGroup>

        <Slider label="Padding X" min="0" max="180" value={paddingX} onChange={setPaddingX} />
        <Slider label="Padding Y" min="0" max="140" value={padding} onChange={setPadding} />
        <Slider label="Radius" min="0" max="52" value={radius} onChange={setRadius} />
        <Slider
          label="Border"
          min="0"
          max="16"
          value={border ? borderWidth : 0}
          onChange={(value) => {
            setBorderWidth(value);
            setBorder(value > 0);
          }}
        />

        <Label text="Watermark text">
          <input
            value={watermarkText}
            placeholder="Share Card"
            onChange={(event) => {
              setWatermarkText(event.target.value);
              if (event.target.value.trim()) setWatermark(true);
            }}
          />
        </Label>

        <div className="toggle-list">
          <Toggle
            label="Border"
            checked={border}
            onChange={(checked) => {
              setBorder(checked);
              setBorderWidth(checked ? Math.max(borderWidth, 1) : 0);
            }}
          />
          <Toggle
            label="No pad"
            checked={padding === 0 && paddingX === 0}
            onChange={(checked) => {
              setPadding(checked ? 0 : 56);
              setPaddingX(checked ? 0 : 56);
            }}
          />
          <Toggle label="Quote marks" checked={quoteMarks} onChange={setQuoteMarks} />
          <Toggle label="Watermark" checked={watermark} onChange={setWatermark} />
        </div>
      </aside>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function Segmented({ items, value, onChange }) {
  return (
    <div className="segmented" role="tablist" aria-label="Capture mode">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={value === item.id ? 'active' : ''}
            onClick={() => onChange(item.id)}
            role="tab"
            aria-selected={value === item.id}
          >
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function EditorBody(props) {
  const {
    mode,
    markdown,
    setMarkdown,
    post,
    setPost,
    code,
    setCode,
    codeTitle,
    setCodeTitle,
    imageCaption,
    setImageCaption,
    onImageUpload
  } = props;

  if (mode === 'post') {
    return (
      <div className="form-stack">
        <Label text="Author">
          <input value={post.author} onChange={(event) => setPost({ ...post, author: event.target.value })} />
        </Label>
        <Label text="Handle">
          <input value={post.handle} onChange={(event) => setPost({ ...post, handle: event.target.value })} />
        </Label>
        <Label text="Post text">
          <textarea value={post.content} onChange={(event) => setPost({ ...post, content: event.target.value })} />
        </Label>
        <Label text="Meta">
          <input value={post.meta} onChange={(event) => setPost({ ...post, meta: event.target.value })} />
        </Label>
        <Toggle label="Verified mark" checked={post.verified} onChange={(checked) => setPost({ ...post, verified: checked })} />
      </div>
    );
  }

  if (mode === 'code') {
    return (
      <div className="form-stack">
        <Label text="File name">
          <input value={codeTitle} onChange={(event) => setCodeTitle(event.target.value)} />
        </Label>
        <Label text="Code">
          <textarea className="code-input" value={code} onChange={(event) => setCode(event.target.value)} />
        </Label>
      </div>
    );
  }

  if (mode === 'image') {
    return (
      <div className="form-stack">
        <label className="upload-box">
          <Upload size={20} />
          <span>Upload image</span>
          <input type="file" accept="image/*" onChange={onImageUpload} />
        </label>
        <Label text="Caption">
          <textarea value={imageCaption} onChange={(event) => setImageCaption(event.target.value)} />
        </Label>
      </div>
    );
  }

  return (
    <div className="form-stack">
      <Label text="Markdown text">
        <textarea className="markdown-input" value={markdown} onChange={(event) => setMarkdown(event.target.value)} />
      </Label>
    </div>
  );
}

function ShotCard({
  mode,
  cleanHtml,
  post,
  code,
  codeTitle,
  imageSrc,
  imageCaption,
  theme,
  shadow,
  radius,
  border,
  borderWidth,
  quoteMarks
}) {
  const visibleBorder = border ? borderWidth : 0;
  const borderColor = getCardBorderColor(theme, visibleBorder);
  const className = `shot-card ${theme}`;
  const style = {
    boxShadow: composeCardShadow(theme, shadow, visibleBorder),
    borderRadius: `${radius}px`,
    '--card-border-width': `${visibleBorder}px`,
    '--card-border-color': borderColor
  };

  if (mode === 'post') {
    return (
      <article className={className} style={style}>
        <div className="post-head">
          <div className="avatar">{initials(post.author)}</div>
          <div>
            <div className="author-line">
              <strong>{post.author || 'Author'}</strong>
              {post.verified && <BadgeCheck size={18} className="verified" />}
            </div>
            <span>{post.handle || '@handle'}</span>
          </div>
        </div>
        <p className="post-content">{post.content}</p>
        <div className="post-meta">{post.meta}</div>
      </article>
    );
  }

  if (mode === 'code') {
    return (
      <article className={`${className} code-card`} style={style}>
        <div className="code-head">
          <div className="traffic-lights">
            <span />
            <span />
            <span />
          </div>
          <strong>{codeTitle || 'snippet.js'}</strong>
          <Clipboard size={15} />
        </div>
        <pre><code>{code}</code></pre>
      </article>
    );
  }

  if (mode === 'image') {
    return (
      <article className={`${className} image-card`} style={style}>
        {imageSrc ? (
          <img src={imageSrc} alt="" />
        ) : (
          <div className="image-placeholder">
            <FileImage size={42} />
            <span>Upload an image</span>
          </div>
        )}
        <p>{imageCaption}</p>
      </article>
    );
  }

  return (
    <article className={className} style={style}>
      {quoteMarks && <Quote className="quote-mark" size={54} />}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </article>
  );
}

function getCardBorderColor(theme, width) {
  if (!width) return 'transparent';
  if (theme === 'glass') return 'rgba(255, 255, 255, 0.68)';
  if (theme === 'dark') return 'rgba(255, 255, 255, 0.16)';
  return 'rgba(255, 255, 255, 0.58)';
}

function composeCardShadow(theme, shadow, borderWidth) {
  const highlights = [];

  if (theme === 'glass') {
    highlights.push('inset 0 1px 0 rgba(255, 255, 255, 0.56)');
    if (borderWidth > 1) {
      highlights.push(`inset 0 0 ${Math.max(10, borderWidth * 2)}px rgba(255, 255, 255, 0.12)`);
    }
  }

  return [shadow !== 'none' ? shadow : '', ...highlights].filter(Boolean).join(', ') || 'none';
}

function BottomDock({
  mode,
  background,
  setBackground,
  shadow,
  setShadow,
  aspect,
  setAspect,
  theme,
  setTheme,
  border,
  setBorder,
  borderWidth,
  setBorderWidth,
  padding,
  setPadding,
  paddingX,
  setPaddingX,
  radius,
  setRadius,
  quoteMarks,
  setQuoteMarks,
  watermark,
  setWatermark,
  watermarkText,
  setWatermarkText,
  onCopy,
  onDownload,
  busy
}) {
  const [activeDock, setActiveDock] = useState(null);

  const applyEdgeToEdge = () => {
    setPadding(0);
    setPaddingX(0);
    setBorder(false);
    setBorderWidth(0);
    setRadius(0);
    setShadow('none');
    setWatermark(false);
  };

  return (
    <div className="bottom-dock" aria-label="Capture controls">
      <DockPopover
        id="screens"
        label="Screens"
        icon={<div className="dock-swatch" style={{ backgroundImage: background }} />}
        activeDock={activeDock}
        setActiveDock={setActiveDock}
      >
        <div className="dock-grid">
          {BACKGROUNDS.map((item) => (
            <button
              key={item.name}
              className={`swatch ${item.value === background ? 'selected' : ''}`}
              style={{ backgroundImage: item.value }}
              onClick={() => setBackground(item.value)}
              aria-label={item.name}
            >
              {item.value === background && <Check size={16} />}
            </button>
          ))}
        </div>
      </DockPopover>

      <DockPopover id="shadows" label="Shadows" icon={<Sparkles size={24} />} activeDock={activeDock} setActiveDock={setActiveDock}>
        <div className="dock-chip-grid">
          {SHADOWS.map((item) => (
            <button
              key={item.name}
              className={`chip ${shadow === item.value ? 'selected' : ''}`}
              onClick={() => setShadow(item.value)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </DockPopover>

      <DockPopover
        id="mode"
        label="Mode"
        icon={theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
        activeDock={activeDock}
        setActiveDock={setActiveDock}
      >
        <div className="dock-chip-grid">
          <button className={`chip icon-chip ${theme === 'light' ? 'selected' : ''}`} onClick={() => setTheme('light')}>
            <Sun size={15} />
            Light
          </button>
          <button className={`chip icon-chip ${theme === 'dark' ? 'selected' : ''}`} onClick={() => setTheme('dark')}>
            <Moon size={15} />
            Dark
          </button>
          <button className={`chip icon-chip ${theme === 'glass' ? 'selected' : ''}`} onClick={() => setTheme('glass')}>
            <Sparkles size={15} />
            Glass
          </button>
        </div>
      </DockPopover>

      <DockPopover
        id="border"
        label="Border"
        icon={<span className="border-icon" style={{ borderWidth: Math.max(1, borderWidth) }} />}
        activeDock={activeDock}
        setActiveDock={setActiveDock}
      >
        <div className="dock-control-stack">
          <Slider
            label="Border"
            min="0"
            max="16"
            value={border ? borderWidth : 0}
            onChange={(value) => {
              setBorderWidth(value);
              setBorder(value > 0);
            }}
          />
          <Slider label="Radius" min="0" max="56" value={radius} onChange={setRadius} />
          <Toggle label="Border" checked={border} onChange={setBorder} />
        </div>
      </DockPopover>

      <DockPopover
        id="aspect"
        label={ASPECTS[aspect].label}
        icon={<FileImage size={24} />}
        activeDock={activeDock}
        setActiveDock={setActiveDock}
      >
        <div className="dock-chip-grid">
          {Object.entries(ASPECTS).map(([key, item]) => (
            <button key={key} className={`chip ${aspect === key ? 'selected' : ''}`} onClick={() => setAspect(key)}>
              {item.label}
            </button>
          ))}
        </div>
      </DockPopover>

      <DockPopover id="controls" label="Controls" icon={<Palette size={24} />} activeDock={activeDock} setActiveDock={setActiveDock}>
        <div className="dock-control-stack">
          <Slider label="Padding X" min="0" max="180" value={paddingX} onChange={setPaddingX} />
          <Slider label="Padding Y" min="0" max="140" value={padding} onChange={setPadding} />
          <Toggle
            label="No pad"
            checked={padding === 0 && paddingX === 0}
            onChange={(checked) => {
              setPadding(checked ? 0 : 56);
              setPaddingX(checked ? 0 : 56);
            }}
          />
          {mode === 'text' && <Toggle label="Quote" checked={quoteMarks} onChange={setQuoteMarks} />}
          <Toggle label="Watermark" checked={watermark} onChange={setWatermark} />
          <label className="dock-field">
            <span>Watermark text</span>
            <input
              value={watermarkText}
              placeholder="Share Card"
              onChange={(event) => {
                setWatermarkText(event.target.value);
                if (event.target.value.trim()) setWatermark(true);
              }}
            />
          </label>
          <button className="wide-dock-button" onClick={applyEdgeToEdge}>Edge to edge</button>
        </div>
      </DockPopover>

      <button className="dock-action" onClick={() => {
        setActiveDock(null);
        onCopy();
      }} disabled={busy}>
        <Copy size={23} />
        <span>Copy</span>
      </button>
      <button className="dock-action primary" onClick={() => {
        setActiveDock(null);
        onDownload();
      }} disabled={busy}>
        <Download size={23} />
        <span>Download</span>
      </button>
    </div>
  );
}

function DockPopover({ id, icon, label, children, activeDock, setActiveDock }) {
  const open = activeDock === id;

  return (
    <div className={`dock-item ${open ? 'open' : ''}`}>
      <div className="dock-popover">{children}</div>
      <button className="dock-button" type="button" onClick={() => setActiveDock(open ? null : id)}>
        {icon}
        <span>{label}</span>
      </button>
    </div>
  );
}

function ControlGroup({ label, children }) {
  return (
    <section className="control-group">
      <h2>{label}</h2>
      {children}
    </section>
  );
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="panel-title">
      <Icon size={18} />
      <strong>{title}</strong>
    </div>
  );
}

function Slider({ label, value, onChange, min = '0', max = '100', ...props }) {
  const sliderId = useId();
  const numberId = useId();
  const minValue = Number(min);
  const maxValue = Number(max);

  const updateValue = (nextValue) => {
    const normalizedValue = Number.isFinite(nextValue) ? nextValue : minValue;
    onChange(Math.min(maxValue, Math.max(minValue, normalizedValue)));
  };

  return (
    <div className="slider-row">
      <label htmlFor={sliderId}>{label}</label>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => updateValue(Number(event.target.value))}
        {...props}
      />
      <span className="slider-value">
        <input
          id={numberId}
          type="number"
          min={min}
          max={max}
          value={value}
          aria-label={`${label} value`}
          onChange={(event) => updateValue(Number(event.target.value))}
        />
        <span>px</span>
      </span>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-ui" />
    </label>
  );
}

function Label({ text, children }) {
  return (
    <label className="field-label">
      <span>{text}</span>
      {children}
    </label>
  );
}

function initials(name) {
  return (name || 'SC')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const rootElement = document.getElementById('root');
const root = globalThis.__shareCardMakerRoot ?? createRoot(rootElement);
globalThis.__shareCardMakerRoot = root;
root.render(<App />);
